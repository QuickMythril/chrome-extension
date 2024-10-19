import { Box, Rating, Typography } from "@mui/material";
import React, { useCallback, useContext, useEffect, useRef, useState } from "react";
import { getFee } from "../../background";
import { MyContext, getBaseApiReact } from "../../App";
import { CustomizedSnackbars } from "../Snackbar/Snackbar";
import { StarFilledIcon } from "../../assets/svgs/StarFilled";
import { StarEmptyIcon } from "../../assets/svgs/StarEmpty";
import { AppInfoUserName } from "./Apps-styles";

export const AppRating = ({app, myName, ratingCountPosition = 'right'}) => {
  const [value, setValue] = useState(0);
  const { show } = useContext(MyContext);
const [hasPublishedRating, setHasPublishedRating] = useState<null | boolean>(null)
const [pollInfo, setPollInfo] = useState(null)
const [votesInfo, setVotesInfo] = useState(null)
const [openSnack, setOpenSnack] = useState(false);
const [infoSnack, setInfoSnack] = useState(null);
const hasCalledRef = useRef(false) 
console.log(`pollinfo-${app?.service}-${app?.name}`, value)

console.log('hasPublishedRating', hasPublishedRating)
const getRating = useCallback(async (name, service)=> {
    try {

        hasCalledRef.current = true
        const pollName = `app-library-${service}-rating-${name}`
        const url = `${getBaseApiReact()}/polls/${pollName}`;

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
    
    const responseData = await response.json();
    console.log('responseData', responseData)
    if(responseData?.message?.includes('POLL_NO_EXISTS')){
        setHasPublishedRating(false)
    } else if(responseData?.pollName){
        setPollInfo(responseData)
        setHasPublishedRating(true)
        const urlVotes = `${getBaseApiReact()}/polls/votes/${pollName}`;

    const responseVotes = await fetch(urlVotes, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
    
    const responseDataVotes = await responseVotes.json();
    setVotesInfo(responseDataVotes)
    const voteCount = responseDataVotes.voteCounts
     // Include initial value vote in the calculation
     const ratingVotes = voteCount.filter(vote => !vote.optionName.startsWith("initialValue-"));
     const initialValueVote = voteCount.find(vote => vote.optionName.startsWith("initialValue-"));
    console.log('initialValueVote', initialValueVote)
     if (initialValueVote) {
       // Convert "initialValue-X" to just "X" and add it to the ratingVotes array
       const initialRating = parseInt(initialValueVote.optionName.split("-")[1], 10);
       console.log('initialRating', initialRating)
       ratingVotes.push({
         optionName: initialRating.toString(),
         voteCount: 1,
       });
     }

     // Calculate the weighted average
     let totalScore = 0;
     let totalVotes = 0;

     ratingVotes.forEach(vote => {
       const rating = parseInt(vote.optionName, 10); // Extract rating value (1-5)
       const count = vote.voteCount;
       totalScore += rating * count; // Weighted score
       totalVotes += count; // Total number of votes
     });
     console.log('ratingVotes', ratingVotes, totalScore, totalVotes)

     // Calculate average rating (ensure no division by zero)
     const averageRating = totalVotes > 0 ? (totalScore / totalVotes) : 0;
     setValue(averageRating);
    }
    } catch (error) {
        console.log('error rating', error)
        if(error?.message?.includes('POLL_NO_EXISTS')){
            setHasPublishedRating(false)
        }
    }

   
}, [])
  useEffect(()=> {
    if(hasCalledRef.current) return
    if(!app) return
    getRating(app?.name, app?.service)
  }, [getRating, app?.name])

  const rateFunc = async (event, newValue)=> {
    try {
        if(!myName) throw new Error('You need a name to rate.')
        if(!app?.name) return
        console.log('newValue', newValue)
        const fee = await getFee("ARBITRARY");

      await show({
        message: `Would you like to rate this app a rating of ${newValue}?`,
        publishFee: fee.fee + " QORT",
      });

      if(hasPublishedRating === false){
        const pollName = `app-library-${app.service}-rating-${app.name}`
        const pollOptions = [`1, 2, 3, 4, 5, initialValue-${newValue}`]
       await new Promise((res, rej)=> {
        chrome?.runtime?.sendMessage({
            action: 'CREATE_POLL', type: 'qortalRequest', payload: {
                pollName: pollName , pollDescription: `Rating for ${app.service} ${app.name}`, pollOptions: pollOptions , pollOwnerAddress  : myName
            }
          }, (response) => {
            console.log('response', response);
            if (response.error) {
              rej(response?.message)
              return
            } else {
              res(response)
              setInfoSnack({
                type: "success",
                message:
                  "Successfully rated. Please wait a couple minutes for the network to propogate the changes.",
              });
              setOpenSnack(true);
            }
          });
       }) 
      } else {
        const pollName = `app-library-${app.service}-rating-${app.name}`
        const optionIndex = pollInfo?.pollOptions.findIndex((option)=> +option.optionName === +newValue)
        if(isNaN(optionIndex) || optionIndex === -1) throw new Error('Cannot find rating option')
        await new Promise((res, rej)=> {
            chrome?.runtime?.sendMessage({
                action: 'VOTE_ON_POLL', type: 'qortalRequest', payload: {
                    pollName: pollName , optionIndex
                }
              }, (response) => {
                console.log('response', response);
                if (response.error) {
                  rej(response?.message)
                  return
                } else {
                  res(response)
                  setInfoSnack({
                    type: "success",
                    message:
                      "Successfully rated. Please wait a couple minutes for the network to propogate the changes.",
                  });
                  setOpenSnack(true);
                }
              });
           }) 
      }
     
    } catch (error) {
        setInfoSnack({
            type: "error",
            message: error.message || "An error occurred while trying to rate.",
        });
        setOpenSnack(true);
    }
  }
  console.log('vvotes', (votesInfo?.totalVotes ?? 0 ) + votesInfo?.voteCounts?.length === 6 ? 1 : 0, votesInfo)
  return (
    <div>
    <Box sx={{
        display: 'flex',
        gap: '5px',
        alignItems: 'center'
    }}>
    <Rating
        value={value}
        onChange={rateFunc}
        precision={1}
        readOnly={hasPublishedRating === null}
        size="small"
        icon={<StarFilledIcon  />} 
        emptyIcon={<StarEmptyIcon  />} 
        sx={{
            display: "flex",
            gap: "2px", 
          }}
      />
        {ratingCountPosition && (
              <AppInfoUserName>
              { (votesInfo?.totalVotes ?? 0) + (votesInfo?.voteCounts?.length === 6 ? 1 : 0)}
                </AppInfoUserName>
        )}
    </Box>
      
       <CustomizedSnackbars
        duration={2000}
        open={openSnack}
        setOpen={setOpenSnack}
        info={infoSnack}
        setInfo={setInfoSnack}
      />
    </div>
  );
};
