import {
  Avatar,
  Box,
  Button,
  IconButton,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Typography,
} from "@mui/material";
import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import SettingsIcon from "@mui/icons-material/Settings";
import { ChatGroup } from "../Chat/ChatGroup";
import { CreateCommonSecret } from "../Chat/CreateCommonSecret";
import { base64ToUint8Array } from "../../qdn/encryption/group-encryption";
import { uint8ArrayToObject } from "../../backgroundFunctions/encryption";
import ChatIcon from "@mui/icons-material/Chat";
import CampaignIcon from "@mui/icons-material/Campaign";
import { AddGroup } from "./AddGroup";
import MarkUnreadChatAltIcon from "@mui/icons-material/MarkUnreadChatAlt";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import CreateIcon from "@mui/icons-material/Create";
import RefreshIcon from "@mui/icons-material/Refresh";

import {
  AuthenticatedContainerInnerRight,
  CustomButton,
} from "../../App-styles";
import ForumIcon from "@mui/icons-material/Forum";
import { Spacer } from "../../common/Spacer";
import PeopleIcon from "@mui/icons-material/People";
import { ManageMembers } from "./ManageMembers";
import MarkChatUnreadIcon from "@mui/icons-material/MarkChatUnread";
import { MyContext, clearAllQueues, getBaseApiReact } from "../../App";
import { ChatDirect } from "../Chat/ChatDirect";
import { CustomizedSnackbars } from "../Snackbar/Snackbar";
import { LoadingButton } from "@mui/lab";
import { LoadingSnackbar } from "../Snackbar/LoadingSnackbar";
import { GroupAnnouncements } from "../Chat/GroupAnnouncements";
import HomeIcon from "@mui/icons-material/Home";

import { ThingsToDoInitial } from "./ThingsToDoInitial";
import { GroupJoinRequests } from "./GroupJoinRequests";
import { GroupForum } from "../Chat/GroupForum";
import { GroupInvites } from "./GroupInvites";
import {
  executeEvent,
  subscribeToEvent,
  unsubscribeFromEvent,
} from "../../utils/events";
import { ListOfThreadPostsWatched } from "./ListOfThreadPostsWatched";
import { RequestQueueWithPromise } from "../../utils/queue/queue";
import { WebSocketActive } from "./WebsocketActive";
import { flushSync } from "react-dom";

interface GroupProps {
  myAddress: string;
  isFocused: boolean;
  isMain: boolean;
  userInfo: any;
  balance: number;
}

const timeDifferenceForNotificationChats = 900000;

export const requestQueueMemberNames = new RequestQueueWithPromise(5);
export const requestQueueAdminMemberNames = new RequestQueueWithPromise(5);

const audio = new Audio(chrome.runtime.getURL("msg-not1.wav"));

export const getGroupAdimnsAddress = async (groupNumber: number) => {
  // const validApi = await findUsableApi();

  const response = await fetch(
    `${getBaseApiReact()}/groups/members/${groupNumber}?limit=0&onlyAdmins=true`
  );
  const groupData = await response.json();
  let members: any = [];
  if (groupData && Array.isArray(groupData?.members)) {
    for (const member of groupData.members) {
      if (member.member) {
        members.push(member?.member);
      }
    }

    return members;
  }
};

export function validateSecretKey(obj) {
  // Check if the input is an object
  if (typeof obj !== "object" || obj === null) {
    return false;
  }

  // Iterate over each key in the object
  for (let key in obj) {
    // Ensure the key is a string representation of a positive integer
    if (!/^\d+$/.test(key)) {
      return false;
    }

    // Get the corresponding value for the key
    const value = obj[key];

    // Check that value is an object and not null
    if (typeof value !== "object" || value === null) {
      return false;
    }

    // Check for messageKey and nonce properties
    if (!value.hasOwnProperty("messageKey") || !value.hasOwnProperty("nonce")) {
      return false;
    }

    // Ensure messageKey and nonce are non-empty strings
    if (
      typeof value.messageKey !== "string" ||
      value.messageKey.trim() === ""
    ) {
      return false;
    }
    if (typeof value.nonce !== "string" || value.nonce.trim() === "") {
      return false;
    }
  }

  // If all checks passed, return true
  return true;
}

export const getGroupMembers = async (groupNumber: number) => {
  // const validApi = await findUsableApi();

  const response = await fetch(
    `${getBaseApiReact()}/groups/members/${groupNumber}?limit=0`
  );
  const groupData = await response.json();
  return groupData;
};

const decryptResource = async (data: string) => {
  try {
    return new Promise((res, rej) => {
      chrome.runtime.sendMessage(
        {
          action: "decryptGroupEncryption",
          payload: {
            data,
          },
        },
        (response) => {
     
          if (!response?.error) {
            res(response);
          }
          rej(response.error);
        }
      );
    });
  } catch (error) {}
};

export async function getNameInfo(address: string) {
  const response = await fetch(`${getBaseApiReact()}/names/address/` + address);
  const nameData = await response.json();

  if (nameData?.length > 0) {
    return nameData[0]?.name;
  } else {
    return "";
  }
}

export const getGroupAdimns = async (groupNumber: number) => {
  // const validApi = await findUsableApi();

  const response = await fetch(
    `${getBaseApiReact()}/groups/members/${groupNumber}?limit=0&onlyAdmins=true`
  );
  const groupData = await response.json();
  let members: any = [];
  // if (groupData && Array.isArray(groupData?.members)) {
  //   for (const member of groupData.members) {
  //     if (member.member) {
  //       const name = await getNameInfo(member.member);
  //       if (name) {
  //         members.push(name);
  //       }
  //     }
  //   }
  // }

  const getMemNames = groupData?.members?.map(async (member) => {
    if (member?.member) {
      const name = await requestQueueAdminMemberNames.enqueue(() => {
        return getNameInfo(member.member);
      });
      if (name) {
        members.push(name);
      }
    }

    return true;
  });
  await Promise.all(getMemNames);

  return members;
};

export const getNames = async (listOfMembers) => {
  // const validApi = await findUsableApi();

  let members: any = [];

  const getMemNames = listOfMembers.map(async (member) => {
    if (member.member) {
      const name = await requestQueueMemberNames.enqueue(() => {
        return getNameInfo(member.member);
      });
      if (name) {
        members.push({ ...member, name });
      } else {
        members.push({ ...member, name: "" });
      }
    }

    return true;
  });

  await Promise.all(getMemNames);

  return members;
};
export const getNamesForAdmins = async (admins) => {
  // const validApi = await findUsableApi();

  let members: any = [];
  // if (admins && Array.isArray(admins)) {
  //   for (const admin of admins) {
  //     const name = await getNameInfo(admin);
  //     if (name) {
  //       members.push({ address: admin, name });
  //     }
  //   }
  // }
  const getMemNames = admins?.map(async (admin) => {
    if (admin) {
      const name = await requestQueueAdminMemberNames.enqueue(() => {
        return getNameInfo(admin);
      });
      if (name) {
        members.push({ address: admin, name });
      }
    }

    return true;
  });
  await Promise.all(getMemNames);

  return members;
};

export const Group = ({
  myAddress,
  isFocused,
  isMain,
  userInfo,
  balance,
}: GroupProps) => {
  const [secretKey, setSecretKey] = useState(null);
  const [secretKeyPublishDate, setSecretKeyPublishDate] = useState(null);
  const [secretKeyDetails, setSecretKeyDetails] = useState(null);
  const [newEncryptionNotification, setNewEncryptionNotification] =
    useState(null);
  const [memberCountFromSecretKeyData, setMemberCountFromSecretKeyData] =
    useState(null);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [selectedDirect, setSelectedDirect] = useState(null);
  const hasInitialized = useRef(false);
  const hasInitializedWebsocket = useRef(false);
  const [groups, setGroups] = useState([]);
  const [directs, setDirects] = useState([]);
  const [admins, setAdmins] = useState([]);
  const [adminsWithNames, setAdminsWithNames] = useState([]);

  const [members, setMembers] = useState([]);
  const [groupOwner, setGroupOwner] = useState(null);
  const [triedToFetchSecretKey, setTriedToFetchSecretKey] = useState(false);
  const [openAddGroup, setOpenAddGroup] = useState(false);
  const [isInitialGroups, setIsInitialGroups] = useState(false);
  const [openManageMembers, setOpenManageMembers] = useState(false);
  const { setMemberGroups, memberGroups } = useContext(MyContext);
  const lastGroupNotification = useRef<null | number>(null);
  const [timestampEnterData, setTimestampEnterData] = useState({});
  const [chatMode, setChatMode] = useState("groups");
  const [newChat, setNewChat] = useState(false);
  const [openSnack, setOpenSnack] = React.useState(false);
  const [infoSnack, setInfoSnack] = React.useState(null);
  const [isLoadingNotifyAdmin, setIsLoadingNotifyAdmin] = React.useState(false);
  const [isLoadingGroups, setIsLoadingGroups] = React.useState(false);
  const [isLoadingGroup, setIsLoadingGroup] = React.useState(false);
  const [firstSecretKeyInCreation, setFirstSecretKeyInCreation] = React.useState(false)
  const [groupSection, setGroupSection] = React.useState("home");
  const [groupAnnouncements, setGroupAnnouncements] = React.useState({});
  const [defaultThread, setDefaultThread] = React.useState(null);

  const isFocusedRef = useRef(true);
  const selectedGroupRef = useRef(null);
  const selectedDirectRef = useRef(null);
  const groupSectionRef = useRef(null);
  const checkGroupInterval = useRef(null);
  const isLoadingOpenSectionFromNotification = useRef(false);
  const setupGroupWebsocketInterval = useRef(null);
  const settimeoutForRefetchSecretKey = useRef(null);


  useEffect(() => {
    isFocusedRef.current = isFocused;
  }, [isFocused]);
  useEffect(() => {
    groupSectionRef.current = groupSection;
  }, [groupSection]);

  useEffect(() => {
    selectedGroupRef.current = selectedGroup;
  }, [selectedGroup]);

  useEffect(() => {
    selectedDirectRef.current = selectedDirect;
  }, [selectedDirect]);



  const getTimestampEnterChat = async () => {
    try {
      return new Promise((res, rej) => {
        chrome.runtime.sendMessage(
          {
            action: "getTimestampEnterChat",
          },
          (response) => {
            if (!response?.error) {
              setTimestampEnterData(response);
              res(response);
            }
            rej(response.error);
          }
        );
      });
    } catch (error) {}
  };
  const refreshHomeDataFunc = () => {
    setGroupSection("default");
    setTimeout(() => {
      setGroupSection("home");
    }, 300);
  };

  const getGroupAnnouncements = async () => {
    try {
      return new Promise((res, rej) => {
        chrome.runtime.sendMessage(
          {
            action: "getGroupNotificationTimestamp",
          },
          (response) => {
            
            if (!response?.error) {
              setGroupAnnouncements(response);
              res(response);
            }
            rej(response.error);
          }
        );
      });
    } catch (error) {}
  };

  const getGroupOwner = async (groupId) => {
    try {
     
      const url = `${getBaseApiReact()}/groups/${groupId}`;
      const response = await fetch(url);
      let data = await response.json();
    
      const name = await getNameInfo(data?.owner);
      if (name) {
        data.name = name;
      }
      setGroupOwner(data);
    } catch (error) {}
  };

  const checkGroupList = React.useCallback(async (address) => {
    try {
      const url = `${getBaseApiReact()}/chat/active/${address}`;
      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      const responseData = await response.json();
      if (!Array.isArray(responseData?.groups)) return;
      const filterOutGeneral = responseData.groups?.filter(
        (item) => item?.groupId !== 0
      );
      const sortedGroups = filterOutGeneral.sort((a, b) => {
        // If a has no timestamp, move it down
        if (!a.timestamp) return 1;
        // If b has no timestamp, move it up
        if (!b.timestamp) return -1;
        // Otherwise, sort by timestamp in descending order (most recent first)
        return b.timestamp - a.timestamp;
      });
      setGroups(sortedGroups);
      setMemberGroups(sortedGroups);
    } catch (error) {
    } finally {
    }
  }, []);
  // const checkGroupListFunc = useCallback((myAddress) => {
  //   let isCalling = false;
  //   checkGroupInterval.current = setInterval(async () => {
  //     if (isCalling) return;
  //     isCalling = true;
  //     const res = await checkGroupList(myAddress);
  //     isCalling = false;
  //   }, 120000);
  // }, []);

  const directChatHasUnread = useMemo(() => {
    let hasUnread = false;
    directs.forEach((direct) => {
      if (
        direct?.sender !== myAddress &&
        direct?.timestamp &&
        ((!timestampEnterData[direct?.address] &&
          Date.now() - direct?.timestamp <
            timeDifferenceForNotificationChats) ||
          timestampEnterData[direct?.address] < direct?.timestamp)
      ) {
        hasUnread = true;
      }
    });
    return hasUnread;
  }, [timestampEnterData, directs, myAddress]);

  // useEffect(() => {
  //   if (!myAddress) return;
  //   checkGroupListFunc(myAddress);
  //   return () => {
  //     if (checkGroupInterval?.current) {
  //       clearInterval(checkGroupInterval.current);
  //     }
  //   };
  // }, [checkGroupListFunc, myAddress]);

  const getPublishesFromAdmins = async (admins: string[]) => {
    // const validApi = await findUsableApi();
    const queryString = admins.map((name) => `name=${name}`).join("&");
    const url = `${getBaseApiReact()}/arbitrary/resources/search?mode=ALL&service=DOCUMENT_PRIVATE&identifier=symmetric-qchat-group-${
      selectedGroup?.groupId
    }&exactmatchnames=true&limit=10&reverse=true&${queryString}`;
    const response = await fetch(url);
    if(!response.ok){
      throw new Error('network error')
    }
    const adminData = await response.json();
 
    const filterId = adminData.filter(
      (data: any) =>
        data.identifier === `symmetric-qchat-group-${selectedGroup?.groupId}`
    );
    if (filterId?.length === 0) {
      return false;
    }
    return filterId[0];
  };
  const getSecretKey = async (loadingGroupParam?: boolean) => {
    try {
      if (loadingGroupParam) {
        setIsLoadingGroup(true);
      }
      if (selectedGroup?.groupId !== selectedGroupRef.current.groupId) {
        if (settimeoutForRefetchSecretKey.current) {
          clearTimeout(settimeoutForRefetchSecretKey.current);
        }
        return;
      }
      const prevGroupId = selectedGroupRef.current.groupId;
      // const validApi = await findUsableApi();
      const groupAdmins = await getGroupAdimns(selectedGroup?.groupId);
      if(!groupAdmins.length){
        throw new Error('Network error')
      }
      const publish = await getPublishesFromAdmins(groupAdmins);
   
      if (prevGroupId !== selectedGroupRef.current.groupId) {
        if (settimeoutForRefetchSecretKey.current) {
          clearTimeout(settimeoutForRefetchSecretKey.current);
        }
        return;
      }
      if (publish === false) {
        setTriedToFetchSecretKey(true);
        settimeoutForRefetchSecretKey.current = setTimeout(() => {
          getSecretKey();
        }, 120000);
        return;
      }
      setSecretKeyPublishDate(publish?.updated || publish?.created);
    
      const res = await fetch(
        `${getBaseApiReact()}/arbitrary/DOCUMENT_PRIVATE/${publish.name}/${
          publish.identifier
        }?encoding=base64`
      );
      const data = await res.text();
   
      const decryptedKey: any = await decryptResource(data);
    
      const dataint8Array = base64ToUint8Array(decryptedKey.data);
      const decryptedKeyToObject = uint8ArrayToObject(dataint8Array);
     
      if (!validateSecretKey(decryptedKeyToObject))
        throw new Error("SecretKey is not valid");
      setSecretKeyDetails(publish);
      setSecretKey(decryptedKeyToObject);
     
      setMemberCountFromSecretKeyData(decryptedKey.count);
      if (decryptedKeyToObject) {
        setTriedToFetchSecretKey(true);
        setFirstSecretKeyInCreation(false)
        return decryptedKeyToObject;
      } else {
        setTriedToFetchSecretKey(true);
      }
     
    } catch (error) {
      if(error === 'Unable to decrypt data'){
        setTriedToFetchSecretKey(true);
        settimeoutForRefetchSecretKey.current = setTimeout(() => {
          getSecretKey();
        }, 120000);
      }
    
    } finally {
      setIsLoadingGroup(false);
    }
  };

  useEffect(() => {
    if (selectedGroup) {
      setTriedToFetchSecretKey(false);
      getSecretKey(true);
      getGroupOwner(selectedGroup?.groupId);
    }
  }, [selectedGroup]);

  // const handleNotification = async (data)=> {
  //   try {
  //     if(isFocusedRef.current){
  //       throw new Error('isFocused')
  //     }
  //     const newActiveChats= data
  //     const oldActiveChats =  await new Promise((res, rej) => {
  //       chrome.runtime.sendMessage(
  //         {
  //           action: "getChatHeads",
  //         },
  //         (response) => {
  //           console.log({ response });
  //           if (!response?.error) {
  //             res(response);
  //           }
  //           rej(response.error);
  //         }
  //       );
  //     });

  //   let results = []
  //   newActiveChats?.groups?.forEach(newChat => {
  //     let isNewer = true;
  //     oldActiveChats?.data?.groups?.forEach(oldChat => {
  //         if (newChat?.timestamp <= oldChat?.timestamp) {
  //             isNewer = false;
  //         }
  //     });
  //     if (isNewer) {
  //       results.push(newChat)
  //         console.log('This newChat is newer than all oldChats:', newChat);
  //     }
  // });

  //     if(results?.length > 0){
  //       if (!lastGroupNotification.current || (Date.now() - lastGroupNotification.current >= 60000)) {
  //         console.log((Date.now() - lastGroupNotification.current >= 60000), lastGroupNotification.current)
  //         chrome.runtime.sendMessage(
  //           {
  //             action: "notification",
  //             payload: {
  //             },
  //           },
  //           (response) => {
  //             console.log({ response });
  //             if (!response?.error) {

  //             }

  //           }
  //         );
  //         audio.play();
  //         lastGroupNotification.current = Date.now()

  //       }
  //     }

  //   } catch (error) {
  //     console.log('error not', error)
  //     if(!isFocusedRef.current){
  //       chrome.runtime.sendMessage(
  //         {
  //           action: "notification",
  //           payload: {
  //           },
  //         },
  //         (response) => {
  //           console.log({ response });
  //           if (!response?.error) {

  //           }

  //         }
  //       );
  //       audio.play();
  //       lastGroupNotification.current = Date.now()
  //     }

  //   } finally {

  //       chrome.runtime.sendMessage(
  //         {
  //           action: "setChatHeads",
  //           payload: {
  //             data,
  //           },
  //         }
  //       );

  //   }
  // }

  const getAdmins = async (groupId) => {
    try {
      const res = await getGroupAdimnsAddress(groupId);
      setAdmins(res);
      const adminsWithNames = await getNamesForAdmins(res);
      setAdminsWithNames(adminsWithNames);
    } catch (error) {}
  };

  useEffect(() => {
    // Listen for messages from the background script
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
   
      if (message.action === "SET_GROUPS") {
        // Update the component state with the received 'sendqort' state
        setGroups(message.payload);
    
        setMemberGroups(message.payload);

        if (selectedGroupRef.current && groupSectionRef.current === "chat") {
          chrome.runtime.sendMessage({
            action: "addTimestampEnterChat",
            payload: {
              timestamp: Date.now(),
              groupId: selectedGroupRef.current.groupId,
            },
          });
        }
        if (selectedDirectRef.current) {
          chrome.runtime.sendMessage({
            action: "addTimestampEnterChat",
            payload: {
              timestamp: Date.now(),
              groupId: selectedDirectRef.current.address,
            },
          });
        }
        setTimeout(() => {
          getTimestampEnterChat();
        }, 200);
      }
      if (message.action === "SET_GROUP_ANNOUNCEMENTS") {
        // Update the component state with the received 'sendqort' state
        setGroupAnnouncements(message.payload);

        if (
          selectedGroupRef.current &&
          groupSectionRef.current === "announcement"
        ) {
          chrome.runtime.sendMessage({
            action: "addGroupNotificationTimestamp",
            payload: {
              timestamp: Date.now(),
              groupId: selectedGroupRef.current.groupId,
            },
          });
          setTimeout(() => {
            getGroupAnnouncements();
          }, 200);
        }
      }
      if (message.action === "SET_DIRECTS") {
        // Update the component state with the received 'sendqort' state
        setDirects(message.payload);

        // if (selectedGroupRef.current) {
        //   chrome.runtime.sendMessage({
        //     action: "addTimestampEnterChat",
        //     payload: {
        //       timestamp: Date.now(),
        //       groupId: selectedGroupRef.current.groupId,
        //     },
        //   });
        // }
        // setTimeout(() => {
        //   getTimestampEnterChat();
        // }, 200);
      } else if (message.action === "PLAY_NOTIFICATION_SOUND") {
        audio.play();
      }
    });
  }, []);

  useEffect(() => {
    if (
      !myAddress ||
      hasInitializedWebsocket.current ||
      !window?.location?.href?.includes("?main=true") ||
      !groups ||
      groups?.length === 0
    )
      return;

    chrome.runtime.sendMessage({ action: "setupGroupWebsocket" });

    hasInitializedWebsocket.current = true;
  }, [myAddress, groups]);

 
  const getMembers = async (groupId) => {
    try {
      const res = await getGroupMembers(groupId);
      setMembers(res);
    } catch (error) {}
  };
  useEffect(() => {
    if (selectedGroup?.groupId) {
      getAdmins(selectedGroup?.groupId);
      getMembers(selectedGroup?.groupId);
    }
  }, [selectedGroup?.groupId]);

  const shouldReEncrypt = useMemo(() => {
   
    if (triedToFetchSecretKey && !secretKeyPublishDate) return true;
    if (
      !secretKeyPublishDate ||
      !memberCountFromSecretKeyData ||
      members.length === 0
    )
      return false;
    const isDiffMemberNumber =
      memberCountFromSecretKeyData !== members?.memberCount &&
      newEncryptionNotification?.text?.data?.numberOfMembers !==
        members?.memberCount;
 
    if (isDiffMemberNumber) return true;

    const latestJoined = members?.members.reduce((maxJoined, current) => {
      return current.joined > maxJoined ? current.joined : maxJoined;
    }, members?.members[0].joined);
 
    if (
      secretKeyPublishDate < latestJoined &&
      newEncryptionNotification?.data?.timestamp < latestJoined
    ) {
      return true;
    }
    return false;
  }, [
    memberCountFromSecretKeyData,
    members,
    secretKeyPublishDate,
    newEncryptionNotification,
    triedToFetchSecretKey,
  ]);

  const notifyAdmin = async (admin) => {
    try {
      setIsLoadingNotifyAdmin(true);
      await new Promise((res, rej) => {
        chrome.runtime.sendMessage(
          {
            action: "notifyAdminRegenerateSecretKey",
            payload: {
              adminAddress: admin.address,
              groupName: selectedGroup?.groupName,
            },
          },
          (response) => {
          
            if (!response?.error) {
              res(response);
            }
            rej(response.error);
          }
        );
      });
      setInfoSnack({
        type: "success",
        message: "Successfully sent notification.",
      });
      setOpenSnack(true);
    } catch (error) {
      setInfoSnack({
        type: "error",
        message: "Unable to send notification",
      });
    } finally {
      setIsLoadingNotifyAdmin(false);
    }
  };

  const isUnreadChat = useMemo(() => {
    const findGroup = groups
      .filter((group) => group?.sender !== myAddress)
      .find((gr) => gr?.groupId === selectedGroup?.groupId);
    if (!findGroup) return false;
    return (
      findGroup?.timestamp &&
      ((!timestampEnterData[selectedGroup?.groupId] &&
        Date.now() - findGroup?.timestamp <
          timeDifferenceForNotificationChats) ||
        timestampEnterData?.[selectedGroup?.groupId] < findGroup?.timestamp)
    );
  }, [timestampEnterData, selectedGroup]);

  const isUnread = useMemo(() => {
    
    if (!selectedGroup) return false;
    return (
      groupAnnouncements?.[selectedGroup?.groupId]?.seentimestamp === false
    );
  }, [groupAnnouncements, selectedGroup, myAddress]);

  const openDirectChatFromNotification = (e) => {
    if (isLoadingOpenSectionFromNotification.current) return;
    isLoadingOpenSectionFromNotification.current = true;
    const directAddress = e.detail?.from;
  
    const findDirect = directs?.find(
      (direct) => direct?.address === directAddress
    );
    if (findDirect?.address === selectedDirect?.address) {
      isLoadingOpenSectionFromNotification.current = false;
      return;
    }
    if (findDirect) {
      setChatMode("directs");
      setSelectedDirect(null);
      setSelectedGroup(null);

      setNewChat(false);

      chrome.runtime.sendMessage({
        action: "addTimestampEnterChat",
        payload: {
          timestamp: Date.now(),
          groupId: findDirect.address,
        },
      });

      setTimeout(() => {
        setSelectedDirect(findDirect);
        getTimestampEnterChat();
        isLoadingOpenSectionFromNotification.current = false;
      }, 200);
    } else {
      isLoadingOpenSectionFromNotification.current = false;
    }
  };

  useEffect(() => {
    subscribeToEvent("openDirectMessage", openDirectChatFromNotification);

    return () => {
      unsubscribeFromEvent("openDirectMessage", openDirectChatFromNotification);
    };
  }, [directs, selectedDirect]);
  const openGroupChatFromNotification = (e) => {
    if (isLoadingOpenSectionFromNotification.current) return;

    const groupId = e.detail?.from;

    const findGroup = groups?.find((group) => +group?.groupId === +groupId);
    if (findGroup?.groupId === selectedGroup?.groupId) {
      isLoadingOpenSectionFromNotification.current = false;

      return;
    }
    if (findGroup) {
      setChatMode("groups");
      setSelectedGroup(null);
      setSelectedDirect(null);

      setNewChat(false);
      setSecretKey(null);
      setSecretKeyPublishDate(null);
      setAdmins([]);
      setSecretKeyDetails(null);
      setAdminsWithNames([]);
      setMembers([]);
      setMemberCountFromSecretKeyData(null);
      setTriedToFetchSecretKey(false);
      setFirstSecretKeyInCreation(false)
      setGroupSection("chat");

      chrome.runtime.sendMessage({
        action: "addTimestampEnterChat",
        payload: {
          timestamp: Date.now(),
          groupId: findGroup.groupId,
        },
      });

      setTimeout(() => {
        setSelectedGroup(findGroup);

        getTimestampEnterChat();
        isLoadingOpenSectionFromNotification.current = false;
      }, 200);
    } else {
      isLoadingOpenSectionFromNotification.current = false;
    }
  };

  useEffect(() => {
    subscribeToEvent("openGroupMessage", openGroupChatFromNotification);

    return () => {
      unsubscribeFromEvent("openGroupMessage", openGroupChatFromNotification);
    };
  }, [groups, selectedGroup]);

  const openGroupAnnouncementFromNotification = (e) => {

    const groupId = e.detail?.from;

    const findGroup = groups?.find((group) => +group?.groupId === +groupId);
    if (findGroup?.groupId === selectedGroup?.groupId) return;
    if (findGroup) {
      setChatMode("groups");
      setSelectedGroup(null);
      setSecretKey(null);
      setSecretKeyPublishDate(null);
      setAdmins([]);
      setSecretKeyDetails(null);
      setAdminsWithNames([]);
      setMembers([]);
      setMemberCountFromSecretKeyData(null);
      setTriedToFetchSecretKey(false);
      setFirstSecretKeyInCreation(false)
      setGroupSection("announcement");
      chrome.runtime.sendMessage({
        action: "addGroupNotificationTimestamp",
        payload: {
          timestamp: Date.now(),
          groupId: findGroup.groupId,
        },
      });
      setTimeout(() => {
        setSelectedGroup(findGroup);

        getGroupAnnouncements();
      }, 200);
    }
  };

  useEffect(() => {
    subscribeToEvent(
      "openGroupAnnouncement",
      openGroupAnnouncementFromNotification
    );

    return () => {
      unsubscribeFromEvent(
        "openGroupAnnouncement",
        openGroupAnnouncementFromNotification
      );
    };
  }, [groups, selectedGroup]);

  const openThreadNewPostFunc = (e) => {
    const data = e.detail?.data;
    const { groupId } = data;
    const findGroup = groups?.find((group) => +group?.groupId === +groupId);
    if (findGroup?.groupId === selectedGroup?.groupId) {
      setGroupSection("forum");
      setDefaultThread(data);
      // setTimeout(() => {
      //   executeEvent("setThreadByEvent", {
      //     data: data
      //   });
      // }, 400);
      return;
    }
    if (findGroup) {
      setChatMode("groups");
      setSelectedGroup(null);
      setSecretKey(null);
      setSecretKeyPublishDate(null);
      setAdmins([]);
      setSecretKeyDetails(null);
      setAdminsWithNames([]);
      setMembers([]);
      setMemberCountFromSecretKeyData(null);
      setTriedToFetchSecretKey(false);
      setFirstSecretKeyInCreation(false)
      setGroupSection("forum");
      setDefaultThread(data);

      setTimeout(() => {
        setSelectedGroup(findGroup);

        getGroupAnnouncements();
      }, 200);
    }
  };

  useEffect(() => {
    subscribeToEvent("openThreadNewPost", openThreadNewPostFunc);

    return () => {
      unsubscribeFromEvent("openThreadNewPost", openThreadNewPostFunc);
    };
  }, [groups, selectedGroup]);

  const handleSecretKeyCreationInProgress = ()=> {
    setFirstSecretKeyInCreation(true)
  }



  return (
    <>
      <WebSocketActive myAddress={myAddress} />
      <CustomizedSnackbars
        open={openSnack}
        setOpen={setOpenSnack}
        info={infoSnack}
        setInfo={setInfoSnack}
      />

      <div
        style={{
          display: "flex",
          width: "100%",
          height: "100$",
          flexDirection: "row",
          alignItems: "flex-start",
        }}
      >
        <div
          style={{
            display: "flex",
            width: "300px",
            flexDirection: "column",
            alignItems: "flex-start",
            height: "100vh",
          }}
        >
          <div
            style={{
              display: "flex",
              width: "100%",
              justifyContent: "center",
              gap: "20px",
              padding: "10px",
            }}
          >
            <CustomButton
              onClick={() => {
                setChatMode((prev) =>
                  prev === "directs" ? "groups" : "directs"
                );
                setNewChat(false);
                setSelectedDirect(null);
                setSelectedGroup(null);
                setGroupSection("default");
              }}
            >
              {chatMode === "groups" && (
                <>
                  <MarkUnreadChatAltIcon
                    sx={{
                      color: directChatHasUnread ? "red" : "white",
                    }}
                  />
                </>
              )}
              {chatMode === "directs" ? "Switch to groups" : "Direct msgs"}
            </CustomButton>
          </div>
          <div
            style={{
              display: "flex",
              width: "300px",
              flexDirection: "column",
              alignItems: "flex-start",
              flexGrow: 1,
              overflowY: "auto",
              visibility: chatMode === "groups" && "hidden",
              position: chatMode === "groups" && "fixed",
              left: chatMode === "groups" && "-1000px",
            }}
          >
            {directs.map((direct: any) => (
              <List className="group-list" dense={true}>
                <ListItem
                  //   secondaryAction={
                  //     <IconButton edge="end" aria-label="delete">
                  //       <SettingsIcon />
                  //     </IconButton>
                  //   }
                  onClick={() => {
                    setSelectedDirect(null);
                    setNewChat(false);
                    setSelectedGroup(null);
                    chrome.runtime.sendMessage({
                      action: "addTimestampEnterChat",
                      payload: {
                        timestamp: Date.now(),
                        groupId: direct.address,
                      },
                    });
                    setTimeout(() => {
                      setSelectedDirect(direct);

                      getTimestampEnterChat();
                    }, 200);
                  }}
                  sx={{
                    display: "flex",
                    width: "100%",
                    flexDirection: "column",
                    cursor: "pointer",
                    border: "1px #232428 solid",
                    padding: "2px",
                    borderRadius: "2px",
                    background:
                      direct?.address === selectedDirect?.address && "white",
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      width: "100%",
                    }}
                  >
                    <ListItemAvatar>
                      <Avatar
                        sx={{
                          background: "#232428",
                          color: "white",
                        }}
                        alt={direct?.name || direct?.address}
                        //  src={`${getBaseApiReact()}/arbitrary/THUMBNAIL/${groupOwner?.name}/qortal_group_avatar_${group.groupId}?async=true`}
                      >
                        {(direct?.name || direct?.address)?.charAt(0)}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={direct?.name || direct?.address}
                      primaryTypographyProps={{
                        style: {
                          color:
                            direct?.address === selectedDirect?.address &&
                            "black",
                          textWrap: "wrap",
                          overflow: "hidden",
                        },
                      }} // Change the color of the primary text
                      secondaryTypographyProps={{
                        style: {
                          color:
                            direct?.address === selectedDirect?.address &&
                            "black",
                        },
                      }}
                      sx={{
                        width: "150px",
                        fontFamily: "Inter",
                        fontSize: "16px",
                      }}
                    />
                    {direct?.sender !== myAddress &&
                      direct?.timestamp &&
                      ((!timestampEnterData[direct?.address] &&
                        Date.now() - direct?.timestamp <
                          timeDifferenceForNotificationChats) ||
                        timestampEnterData[direct?.address] <
                          direct?.timestamp) && (
                        <MarkChatUnreadIcon
                          sx={{
                            color: "red",
                          }}
                        />
                      )}
                  </Box>
                </ListItem>
              </List>
            ))}
          </div>
          <div
            style={{
              display: "flex",
              width: "300px",
              flexDirection: "column",
              alignItems: "flex-start",
              flexGrow: 1,
              overflowY: "auto",
              visibility: chatMode === "directs" && "hidden",
              position: chatMode === "directs" && "fixed",
              left: chatMode === "directs" && "-1000px",
            }}
          >
            {groups.map((group: any) => (
              <List className="group-list" dense={true}>
                <ListItem
                  //   secondaryAction={
                  //     <IconButton edge="end" aria-label="delete">
                  //       <SettingsIcon />
                  //     </IconButton>
                  //   }
                  onClick={() => {
                    clearAllQueues()
                    setSelectedDirect(null);

                    setNewChat(false);
                    setSelectedGroup(null);
                    setSecretKey(null);
                    setSecretKeyPublishDate(null);
                    setAdmins([]);
                    setSecretKeyDetails(null);
                    setAdminsWithNames([]);
                    setMembers([]);
                    setMemberCountFromSecretKeyData(null);
                    setTriedToFetchSecretKey(false);
                    setFirstSecretKeyInCreation(false)
                    setGroupSection("announcement");

                    setTimeout(() => {
                      setSelectedGroup(group);

                      getTimestampEnterChat();
                    }, 200);

                    if (groupSectionRef.current === "announcement") {
                      chrome.runtime.sendMessage({
                        action: "addGroupNotificationTimestamp",
                        payload: {
                          timestamp: Date.now(),
                          groupId: group.groupId,
                        },
                      });
                    }

                    setTimeout(() => {
                      getGroupAnnouncements();
                    }, 600);
                  }}
                  sx={{
                    display: "flex",
                    width: "100%",
                    flexDirection: "column",
                    cursor: "pointer",
                    border: "1px #232428 solid",
                    padding: "2px",
                    borderRadius: "2px",
                    background:
                      group?.groupId === selectedGroup?.groupId && "white",
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      width: "100%",
                    }}
                  >
                    <ListItemAvatar>
                      <Avatar
                        sx={{
                          background: "#232428",
                          color: "white",
                        }}
                        alt={group?.groupName}
                        //  src={`${getBaseApiReact()}/arbitrary/THUMBNAIL/${groupOwner?.name}/qortal_group_avatar_${group.groupId}?async=true`}
                      >
                        {group.groupName?.charAt(0)}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={group.groupName}
                      primaryTypographyProps={{
                        style: {
                          color:
                            group?.groupId === selectedGroup?.groupId &&
                            "black",
                        },
                      }} // Change the color of the primary text
                      secondaryTypographyProps={{
                        style: {
                          color:
                            group?.groupId === selectedGroup?.groupId &&
                            "black",
                        },
                      }}
                      sx={{
                        width: "150px",
                        fontFamily: "Inter",
                        fontSize: "16px",
                      }}
                    />
                    {groupAnnouncements[group?.groupId] &&
                      !groupAnnouncements[group?.groupId]?.seentimestamp && (
                        <CampaignIcon
                          sx={{
                            color: "red",
                            marginRight: "5px",
                          }}
                        />
                      )}
                    {group?.sender !== myAddress &&
                      group?.timestamp &&
                      ((!timestampEnterData[group?.groupId] &&
                        Date.now() - group?.timestamp <
                          timeDifferenceForNotificationChats) ||
                        timestampEnterData[group?.groupId] <
                          group?.timestamp) && (
                        <MarkChatUnreadIcon
                          sx={{
                            color: "red",
                          }}
                        />
                      )}
                  </Box>
                </ListItem>
              </List>
            ))}
          </div>
          <div
            style={{
              display: "flex",
              width: "100%",
              justifyContent: "center",
              padding: "10px",
            }}
          >
            {chatMode === "groups" && (
              <CustomButton
                onClick={() => {
                  setOpenAddGroup(true);
                }}
              >
                <AddCircleOutlineIcon
                  sx={{
                    color: "white",
                  }}
                />
                Add Group
              </CustomButton>
            )}
            {chatMode === "directs" && (
              <CustomButton
                onClick={() => {
                  setNewChat(true);
                  setSelectedDirect(null);
                  setSelectedGroup(null);
                }}
              >
                <CreateIcon
                  sx={{
                    color: "white",
                  }}
                />
                New Chat
              </CustomButton>
            )}
          </div>
        </div>
        <AddGroup
          address={myAddress}
          open={openAddGroup}
          setOpen={setOpenAddGroup}
        />
        {newChat && (
          <>
            <ChatDirect
              myAddress={myAddress}
              myName={userInfo?.name}
              isNewChat={newChat}
              selectedDirect={undefined}
              setSelectedDirect={setSelectedDirect}
              setNewChat={setNewChat}
              getTimestampEnterChat={getTimestampEnterChat}
            />
          </>
        )}
        {selectedGroup && !newChat && (
          <>
            <Box
              sx={{
                position: "relative",
                flexGrow: 1,
                display: "flex",
                height: "100%",
              }}
            >
              {triedToFetchSecretKey &&  (
                <ChatGroup
                myAddress={myAddress}
                selectedGroup={selectedGroup?.groupId}
                getSecretKey={getSecretKey}
                secretKey={secretKey}
                setSecretKey={setSecretKey}
                handleNewEncryptionNotification={
                  setNewEncryptionNotification
                }
                hide={groupSection !== "chat" || !secretKey}
                handleSecretKeyCreationInProgress={handleSecretKeyCreationInProgress}
                triedToFetchSecretKey={triedToFetchSecretKey}
              />
              )}
               {firstSecretKeyInCreation && triedToFetchSecretKey && !secretKeyPublishDate && (
                <div
                style={{
                  display: "flex",
                  width: "100%",
                  height: "100$",
                  flexDirection: "column",
                  alignItems: "flex-start",
                  padding: "20px",
                }}
              >
                {" "}
                <Typography>
                  The group's first common encryption key is in the process of creation. Please wait a few minutes for it to be retrieved by the network. Checking every 2 minutes...
                </Typography>       
              </div>
               )}
              {!admins.includes(myAddress) &&
              !secretKey &&
              triedToFetchSecretKey  ? (
                <>
                {(secretKeyPublishDate || !secretKeyPublishDate && !firstSecretKeyInCreation) ? (
                    <div
                    style={{
                      display: "flex",
                      width: "100%",
                      height: "100$",
                      flexDirection: "column",
                      alignItems: "flex-start",
                      padding: "20px",
                    }}
                  >
                    {" "}
                    <Typography>
                      You are not part of the encrypted group of members. Wait
                      until an admin re-encrypts the keys.
                    </Typography>
                    <Spacer height="25px" />
                    <Typography>
                      Try notifying an admin from the list of admins below:
                    </Typography>
                    <Spacer height="25px" />
                    {adminsWithNames.map((admin) => {
                
                      return (
                        <Box
                          sx={{
                            display: "flex",
                            gap: "20px",
                            padding: "15px",
                            alignItems: "center",
                          }}
                        >
                          <Typography>{admin?.name}</Typography>
                          <LoadingButton
                            loading={isLoadingNotifyAdmin}
                            loadingPosition="start"
                            variant="contained"
                            onClick={() => notifyAdmin(admin)}
                          >
                            Notify
                          </LoadingButton>
                        </Box>
                      );
                    })}
                  </div>
                ) : null}
                </>
              
              ) : admins.includes(myAddress) &&
                !secretKey &&
                triedToFetchSecretKey ? null : !triedToFetchSecretKey ? null : (
                <>
                 

                  <GroupAnnouncements
                    myAddress={myAddress}
                    selectedGroup={selectedGroup?.groupId}
                    getSecretKey={getSecretKey}
                    secretKey={secretKey}
                    setSecretKey={setSecretKey}
                    isAdmin={admins.includes(myAddress)}
                    handleNewEncryptionNotification={
                      setNewEncryptionNotification
                    }
                    myName={userInfo?.name}
                    hide={groupSection !== "announcement"}
                  />
                  <GroupForum
                    myAddress={myAddress}
                    selectedGroup={selectedGroup}
                    userInfo={userInfo}
                    getSecretKey={getSecretKey}
                    secretKey={secretKey}
                    setSecretKey={setSecretKey}
                    isAdmin={admins.includes(myAddress)}
                    hide={groupSection !== "forum"}
                    defaultThread={defaultThread}
                    setDefaultThread={setDefaultThread}
                  />
                </>
              )}

              <Box
                sx={{
                  display: "flex",
                  position: "absolute",
                  bottom: "25px",
                  right: "25px",
                  zIndex: 100,
                }}
              >
                {admins.includes(myAddress) &&
                  shouldReEncrypt &&
                  triedToFetchSecretKey && !firstSecretKeyInCreation && (
                    <CreateCommonSecret
                      groupId={selectedGroup?.groupId}
                      secretKey={secretKey}
                      secretKeyDetails={secretKeyDetails}
                      myAddress={myAddress}
                      isOwner={groupOwner?.owner === myAddress}
                      userInfo={userInfo}
                      noSecretKey={
                        admins.includes(myAddress) &&
                        !secretKey &&
                        triedToFetchSecretKey
                      }
                    />
                  )}
              </Box>
            </Box>
            {openManageMembers && (
              <ManageMembers
                selectedGroup={selectedGroup}
                address={myAddress}
                open={openManageMembers}
                setOpen={setOpenManageMembers}
                isAdmin={admins.includes(myAddress)}
                isOwner={groupOwner?.owner === myAddress}
              />
            )}

            <AuthenticatedContainerInnerRight
              sx={{
                marginLeft: "auto",
                width: "auto",
                padding: "5px",
              }}
            >
              <Spacer height="20px" />
              <Box
                sx={{
                  display: "flex",
                  gap: "3px",
                  alignItems: "center",
                  justifyContent: "flex-start",
                  width: "100%",
                  cursor: 'pointer'
                }}
                onClick={async () => {
                  setGroupSection("default");
                  clearAllQueues()
                  await new Promise((res) => {
                    setTimeout(() => {
                      res(null);
                    }, 200);
                  });
                  setGroupSection("home");
                  setSelectedGroup(null);
                  setNewChat(false);
                  setSelectedDirect(null);
                  setSecretKey(null);
                  setSecretKeyPublishDate(null);
                  setAdmins([]);
                  setSecretKeyDetails(null);
                  setAdminsWithNames([]);
                  setMembers([]);
                  setMemberCountFromSecretKeyData(null);
                  setTriedToFetchSecretKey(false);
                  setFirstSecretKeyInCreation(false)
                }}
              >
                <HomeIcon
                 
                  sx={{
                    cursor: "pointer",
                    color: groupSection === "home" ? "#1444c7" : "white",
                    opacity: groupSection === "home" ? 1 : 0.4,
                  }}
                />
                <Typography
                  sx={{
                    fontSize: "12px",
                    color: groupSection === "home" ? "#1444c7" : "white",
                    opacity: groupSection === "home" ? 1 : 0.4,
                  }}
                >
                  Home
                </Typography>
              </Box>

              <Spacer height="20px" />
              <Box
                sx={{
                  display: "flex",
                  gap: "3px",
                  alignItems: "center",
                  justifyContent: "flex-start",
                  width: "100%",
                  cursor: 'pointer'
                }}
                onClick={async () => {
                  setGroupSection("default");
                  await new Promise((res) => {
                    setTimeout(() => {
                      res(null);
                    }, 200);
                  });
                  setGroupSection("announcement");
                  chrome.runtime.sendMessage({
                    action: "addGroupNotificationTimestamp",
                    payload: {
                      timestamp: Date.now(),
                      groupId: selectedGroupRef.current.groupId,
                    },
                  });
                  setTimeout(() => {
                    getGroupAnnouncements();
                  }, 200);
                }}
              >
                <CampaignIcon
                  
                  sx={{
                    cursor: "pointer",
                    color: isUnread
                      ? "red"
                      : groupSection === "announcement"
                      ? "#1444c7"
                      : "white",
                    opacity: groupSection === "announcement" ? 1 : 0.4,
                  }}
                />
                <Typography
                  sx={{
                    fontSize: "12px",
                    color: isUnread
                    ? "red"
                    : groupSection === "announcement"
                    ? "#1444c7"
                    : "white",
                  opacity: groupSection === "announcement" ? 1 : 0.4,
                  }}
                >
                  Announcements
                </Typography>
              </Box>

              <Spacer height="20px" />
              <Box
                sx={{
                  display: "flex",
                  gap: "3px",
                  alignItems: "center",
                  justifyContent: "flex-start",
                  width: "100%",
                  cursor: 'pointer'
                }}
                onClick={async () => {
                  setGroupSection("default");
                  await new Promise((res) => {
                    setTimeout(() => {
                      res(null);
                    }, 200);
                  });
                  setGroupSection("chat");
                  if (selectedGroupRef.current) {
                    chrome.runtime.sendMessage({
                      action: "addTimestampEnterChat",
                      payload: {
                        timestamp: Date.now(),
                        groupId: selectedGroupRef.current.groupId,
                      },
                    });

                    setTimeout(() => {
                      getTimestampEnterChat();
                    }, 200);
                  }
                }}
              >
                <ChatIcon
                  
                  sx={{
                    cursor: "pointer",
                    color: isUnreadChat
                      ? "red"
                      : groupSection === "chat"
                      ? "#1444c7"
                      : "white",
                    opacity: groupSection === "chat" ? 1 : 0.4,
                  }}
                />
                <Typography
                  sx={{
                    fontSize: "12px",
                    color: isUnreadChat
                    ? "red"
                    : groupSection === "chat"
                    ? "#1444c7"
                    : "white",
                  opacity: groupSection === "chat" ? 1 : 0.4,
                  }}
                >
                  Chat
                </Typography>
              </Box>

              <Spacer height="20px" />
              <Box
                sx={{
                  display: "flex",
                  gap: "3px",
                  alignItems: "center",
                  justifyContent: "flex-start",
                  width: "100%",
                  cursor: 'pointer'
                }}
                onClick={() => {
                  setGroupSection("forum");
                }}
              >
                <ForumIcon
                  
                  sx={{
                    cursor: "pointer",
                    color: groupSection === "forum" ? "#1444c7" : "white",
                    opacity: groupSection === "forum" ? 1 : 0.4,
                  }}
                />
                <Typography
                  sx={{
                    fontSize: "12px",
                    color: groupSection === "forum" ? "#1444c7" : "white",
                    opacity: groupSection === "forum" ? 1 : 0.4,
                  }}
                >
                  Forum
                </Typography>
              </Box>
              <Spacer height="20px" />
              <Box
               onClick={() => setOpenManageMembers(true)}
                sx={{
                  display: "flex",
                  gap: "3px",
                  alignItems: "center",
                  justifyContent: "flex-start",
                  width: "100%",
                  cursor: 'pointer'
                }}
              >
              <PeopleIcon
               
                sx={{
                  cursor: "pointer",
                  color: "white",
                  opacity: 0.4,
                }}
              />
               <Typography
                  sx={{
                    fontSize: "12px",
                    color: "white",
                  opacity: 0.4,
                  }}
                >
                  Members
                </Typography>
              </Box>
              <Spacer height="20px" />
              {/* <SettingsIcon
              sx={{
                cursor: "pointer",
                color: "white",
              }}
            /> */}
            </AuthenticatedContainerInnerRight>
          </>
        )}

        {selectedDirect && !newChat && (
          <>
            <Box
              sx={{
                position: "relative",
                flexGrow: 1,
                display: "flex",
              }}
            >
              <ChatDirect
                myAddress={myAddress}
                isNewChat={newChat}
                selectedDirect={selectedDirect}
                setSelectedDirect={setSelectedDirect}
                setNewChat={setNewChat}
                getTimestampEnterChat={getTimestampEnterChat}
              />
            </Box>
          </>
        )}
        {!selectedDirect &&
          !selectedGroup &&
          !newChat &&
          groupSection === "home" && (
            <Box
              sx={{
                display: "flex",
                width: "100%",
                flexDirection: "column",
                gap: "20px",
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  width: "100%",
                  justifyContent: "flex-start",
                }}
              >
                <Button
                  variant="outlined"
                  startIcon={<RefreshIcon />}
                  onClick={refreshHomeDataFunc}
                  sx={{
                    color: "white",
                  }}
                >
                  Refresh home data
                </Button>
              </Box>

              <Box
                sx={{
                  display: "flex",
                  gap: "40px",
                  flexWrap: "wrap",
                }}
              >
                <ThingsToDoInitial
                  balance={balance}
                  myAddress={myAddress}
                  name={userInfo?.name}
                  hasGroups={groups?.length !== 0}
                />
                <GroupJoinRequests
                  setGroupSection={setGroupSection}
                  setSelectedGroup={setSelectedGroup}
                  getTimestampEnterChat={getTimestampEnterChat}
                  setOpenManageMembers={setOpenManageMembers}
                  myAddress={myAddress}
                  groups={groups}
                />
                <GroupInvites
                  setOpenAddGroup={setOpenAddGroup}
                  myAddress={myAddress}
                  groups={groups}
                />
                <ListOfThreadPostsWatched />
              </Box>
            </Box>
          )}
        <LoadingSnackbar
          open={isLoadingGroups}
          info={{
            message: "Loading groups... please wait.",
          }}
        />
        <LoadingSnackbar
          open={isLoadingGroup}
          info={{
            message: "Setting up group... please wait.",
          }}
        />
      </div>
    </>
  );
};