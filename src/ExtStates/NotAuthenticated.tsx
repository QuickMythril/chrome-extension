import React, { useCallback, useEffect, useRef, useState } from "react";
import { Spacer } from "../common/Spacer";
import { CustomButton, TextItalic, TextP, TextSpan } from "../App-styles";
import {
  Box,
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  Input,
  Switch,
  Tooltip,
  Typography,
} from "@mui/material";
import Logo1 from "../assets/svgs/Logo1.svg";
import Logo1Dark from "../assets/svgs/Logo1Dark.svg";
import Info from "../assets/svgs/Info.svg";
import { CustomizedSnackbars } from "../components/Snackbar/Snackbar";
import { set } from "lodash";
import { cleanUrl, isUsingLocal } from "../background";

export const NotAuthenticated = ({
  getRootProps,
  getInputProps,
  setExtstate,


  apiKey,
  setApiKey,
  globalApiKey,
  handleSetGlobalApikey,
}) => {
  console.log("apiKey", apiKey);
  const [isValidApiKey, setIsValidApiKey] = useState<boolean | null>(null);
  const [hasLocalNode, setHasLocalNode] = useState<boolean | null>(null);
  const [useLocalNode, setUseLocalNode] = useState(false);
  const [openSnack, setOpenSnack] = React.useState(false);
  const [infoSnack, setInfoSnack] = React.useState(null);
  const [show, setShow] = React.useState(false);
  const [mode, setMode] = React.useState("list");
  const [customNodes, setCustomNodes] = React.useState(null);
  const [currentNode, setCurrentNode] = React.useState({
    url: "http://127.0.0.1:12391",
  });
  const [importedApiKey, setImportedApiKey] = React.useState(null);
  //add and edit states
  const [url, setUrl] = React.useState("http://");
  const [customApikey, setCustomApiKey] = React.useState("");
  const [customNodeToSaveIndex, setCustomNodeToSaveIndex] =
    React.useState(null);
    const importedApiKeyRef = useRef(null)
    const currentNodeRef = useRef(null)

  const isLocal = cleanUrl(currentNode?.url) === "127.0.0.1:12391";
  const handleFileChangeApiKey = (event) => {
    const file = event.target.files[0]; // Get the selected file
    console.log('file', file)
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target.result; // Get the file content
        console.log('text', text)

        setImportedApiKey(text); // Store the file content in the state
      };
      reader.readAsText(file); // Read the file as text
    }
  };

  const checkIfUserHasLocalNode = useCallback(async () => {
    try {
      const url = `http://127.0.0.1:12391/admin/status`;
      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      const data = await response.json();
      if (data?.height) {
        setHasLocalNode(true);
      }
    } catch (error) {}
  }, []);

  useEffect(() => {
    checkIfUserHasLocalNode();
  }, []);

  useEffect(() => {
    chrome?.runtime?.sendMessage(
      { action: "getCustomNodesFromStorage" },
      (response) => {
        if (response) {
          console.log("response", response);
          setCustomNodes(response || []);
        }
      }
    );
  }, []);

  useEffect(()=> {
    importedApiKeyRef.current = importedApiKey
  }, [importedApiKey])
  useEffect(()=> {
    currentNodeRef.current = currentNode
  }, [currentNode])

  console.log('currentNode', currentNode)

  const validateApiKey = useCallback(async (key) => {
    try {
        console.log('currentNodeRef.current', currentNodeRef.current, key)
        if(!currentNodeRef.current) return
        const isLocalKey = cleanUrl(key?.url) === "127.0.0.1:12391";
        const isCurrentNodeLocal = cleanUrl(currentNodeRef.current?.url) === "127.0.0.1:12391";
        if(isLocalKey && !isCurrentNodeLocal) {
            setIsValidApiKey(false);
            setUseLocalNode(false);
            return
        }
      let payload = {};

      if (currentNodeRef.current?.url === "http://127.0.0.1:12391") {
        payload = {
          apikey: importedApiKeyRef.current || key?.apikey,
          url: currentNode?.url,
        };
      } else if(currentNodeRef.current) {
        payload = currentNodeRef.current;
      }
      console.log('payload', payload)
      const url = `${payload?.url}/admin/apikey/test`;
      const response = await fetch(url, {
        method: "GET",
        headers: {
          accept: "text/plain",
          "X-API-KEY": payload?.apikey, // Include the API key here
        },
      });

      // Assuming the response is in plain text and will be 'true' or 'false'
      const data = await response.text();
      console.log("data", data);
      if (data === "true") {
        chrome?.runtime?.sendMessage(
          { action: "setApiKey", payload },
          (response) => {
            console.log("setApiKey", response);
            if (response) {
              handleSetGlobalApikey(payload);
              setIsValidApiKey(true);
              setUseLocalNode(true);
            }
          }
        );
      } else {
        setIsValidApiKey(false);
        setUseLocalNode(false);
        setInfoSnack({
          type: "error",
          message: "Select a valid apikey",
        });
        setOpenSnack(true);
      }
    } catch (error) {
      setIsValidApiKey(false);
      setUseLocalNode(false);
      setInfoSnack({
        type: "error",
        message: "Select a valid apikey",
      });
      console.error("Error validating API key:", error);
    }
  }, []);

  useEffect(() => {
    if (apiKey) {
      validateApiKey(apiKey);
    }
  }, [apiKey]);

  const addCustomNode = () => {
    setMode("add-node");
  };

  const saveCustomNodes = (myNodes) => {
    let nodes = [...(myNodes || [])];
    console.log("customNodeToSaveIndex", customNodeToSaveIndex);
    if (customNodeToSaveIndex !== null) {
      nodes.splice(customNodeToSaveIndex, 1, {
        url,
        apikey: customApikey,
      });
    } else if (url && customApikey) {
      nodes.push({
        url,
        apikey: customApikey,
      });
    }

    setCustomNodes(nodes);
    setCustomNodeToSaveIndex(null);
    if (!nodes) return;
    chrome?.runtime?.sendMessage(
      { action: "setCustomNodes", nodes },
      (response) => {
        console.log("setCustomNodes", response);
        if (response) {
          setMode("list");
          setUrl("http://");
          setCustomApiKey("");
          // add alert
        }
      }
    );
  };

  console.log("render customNodes", customNodes, mode);

  return (
    <>
      <Spacer height="48px" />
      <div
        className="image-container"
        style={{
          width: "136px",
          height: "154px",
        }}
      >
        <img src={Logo1} className="base-image" />
        <img src={Logo1Dark} className="hover-image" />
      </div>
      <Spacer height="38px" />
      <TextP
        sx={{
          textAlign: "center",
          lineHeight: "15px",
        }}
      >
        WELCOME TO <TextItalic>YOUR</TextItalic> <br></br>
        <TextSpan> QORTAL WALLET</TextSpan>
      </TextP>
      <Spacer height="38px" />
      <Box
        sx={{
          display: "flex",
          gap: "10px",
          alignItems: "center",
          marginLeft: "28px",
        }}
      >
        <CustomButton {...getRootProps()}>
          <input {...getInputProps()} />
          Authenticate
        </CustomButton>
        <Tooltip title="Authenticate by importing your Qortal JSON file" arrow>
          <img src={Info} />
        </Tooltip>
      </Box>

      <Spacer height="6px" />
      <Box
        sx={{
          display: "flex",
          gap: "10px",
          alignItems: "center",
          marginLeft: "28px",
        }}
      >
        <CustomButton
          onClick={() => {
            setExtstate("create-wallet");
          }}
        >
          Create account
        </CustomButton>

        <img
          src={Info}
          style={{
            visibility: "hidden",
          }}
        />
      </Box>
        <Spacer height="15px" />
        
        <Typography
                      sx={{
                        fontSize: "12px",
                        visibility: !useLocalNode && 'hidden'
                      }}
                    >
                      {"Using node: "} {apiKey?.url}
                    </Typography>
      <>
        <Spacer height="15px" />
        <Box
          sx={{
            display: "flex",
            gap: "10px",
            alignItems: "center",
            flexDirection: "column",
          }}
        >
          <>
            <Box
              sx={{
                display: "flex",
                gap: "10px",
                alignItems: "center",
                justifyContent: "center",
                width: "100%",
              }}
            >
              <FormControlLabel
                control={
                  <Switch
                    sx={{
                      "& .MuiSwitch-switchBase.Mui-checked": {
                        color: "#5EB049",
                      },
                      "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track":
                        {
                          backgroundColor: "white", // Change track color when checked
                        },
                    }}
                    checked={useLocalNode}
                    onChange={(event) => {
                      if (event.target.checked) {
                        validateApiKey(currentNode);
                      } else {
                        setCurrentNode({
                            url: "http://127.0.0.1:12391",
                          })
                          setUseLocalNode(false)
                          chrome?.runtime?.sendMessage(
                            { action: "setApiKey", payload:null },
                            (response) => {
                              console.log("setApiKey", response);
                              if (response) {
                                setApiKey(null);
                                handleSetGlobalApikey(null);
                               
                              }
                            }
                          );
                      }
                       
                    }}
                    disabled={false}
                    defaultChecked
                  />
                }
                label={`Use ${isLocal ? 'Local' : 'Custom'} Node`}
              />
            </Box>
            {currentNode?.url === "http://127.0.0.1:12391" && (
              <>
                <Button variant="contained" component="label">
                  {apiKey ? "Change " : "Import "} apiKey.txt
                  <input
                    type="file"
                    accept=".txt"
                    hidden
                    onChange={handleFileChangeApiKey} // File input handler
                  />
                </Button>
                <Spacer height="5px" />

             
               
              </>
            )}
             <Button
                  onClick={() => {
                    setShow(true);
                  }}
                  variant="contained"
                  component="label"
                >
                  Choose custom node
                </Button>
          </>
        </Box>
      </>
      <CustomizedSnackbars
        open={openSnack}
        setOpen={setOpenSnack}
        info={infoSnack}
        setInfo={setInfoSnack}
      />
      {show && (
        <Dialog
          open={show}
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description"
          fullWidth
        >
          <DialogTitle id="alert-dialog-title">{"Custom nodes"}</DialogTitle>
          <DialogContent>
            <Box
              sx={{
                width: "100% !important",
                overflow: "auto",
                height: "60vh",
                display: "flex",
                flexDirection: "column",
              }}
            >
              {mode === "list" && (
                <Box
                  sx={{
                    gap: "20px",
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      gap: "10px",
                      flexDirection: "column",
                    }}
                  >
                    <Typography
                      sx={{
                        color: "white",
                        fontSize: "14px",
                      }}
                    >
                      http://127.0.0.1:12391
                    </Typography>
                    <Box
                      sx={{
                        display: "flex",
                        gap: "10px",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <Button
                        disabled={currentNode?.url === "http://127.0.0.1:12391"}
                        size="small"
                        onClick={() => {
                          setCurrentNode({
                            url: "http://127.0.0.1:12391",
                          });
                          setMode("list");
                          setShow(false);
                        }}
                        variant="contained"
                      >
                        Choose
                      </Button>
                    </Box>
                  </Box>

                  {customNodes?.map((node, index) => {
                    return (
                      <Box
                        sx={{
                          display: "flex",
                          gap: "10px",
                          flexDirection: "column",
                        }}
                      >
                        <Typography
                          sx={{
                            color: "white",
                            fontSize: "14px",
                          }}
                        >
                          {node?.url}
                        </Typography>
                        <Box
                          sx={{
                            display: "flex",
                            gap: "10px",
                            justifyContent: "space-between",
                            alignItems: "center",
                          }}
                        >
                          <Button
                            disabled={currentNode?.url === node?.url}
                            size="small"
                            onClick={() => {
                              setCurrentNode({
                                url: node?.url,
                                apikey: node?.apikey,
                              });
                              setMode("list");
                              setShow(false);
                              setIsValidApiKey(false);
                             setUseLocalNode(false);
                            }}
                            variant="contained"
                          >
                            Choose
                          </Button>
                          <Button
                            size="small"
                            onClick={() => {
                              setCustomApiKey(node?.apikey);
                              setUrl(node?.url);
                              setMode("add-node");
                              setCustomNodeToSaveIndex(index);
                            }}
                            variant="contained"
                          >
                            Edit
                          </Button>
                          <Button
                            size="small"
                            onClick={() => {
                              const nodesToSave = [
                                ...(customNodes || []),
                              ].filter((item) => item?.url !== node?.url);
                              console.log(
                                "nodesToSave",
                                nodesToSave,
                                customNodes,
                                node
                              );

                              saveCustomNodes(nodesToSave);
                            }}
                            variant="contained"
                          >
                            Remove
                          </Button>
                        </Box>
                      </Box>
                    );
                  })}
                </Box>
              )}
              {mode === "add-node" && (
                <Box
                  sx={{
                    display: "flex",
                    gap: "10px",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <Input
                    placeholder="Url"
                    value={url}
                    onChange={(e) => {
                      setUrl(e.target.value);
                    }}
                  />
                  <Input
                    placeholder="Api key"
                    value={customApikey}
                    onChange={(e) => {
                      setCustomApiKey(e.target.value);
                    }}
                  />
                </Box>
              )}
            </Box>
          </DialogContent>
          <DialogActions>
            {mode === "list" && (
              <>
                <Button
                  variant="contained"
                  onClick={() => {
                    setShow(false);
                  }}
                  autoFocus
                >
                  Close
                </Button>
              </>
            )}
            {mode === "list" && (
              <Button variant="contained" onClick={addCustomNode}>
                Add
              </Button>
            )}

            {mode === "add-node" && (
              <>
                <Button
                  variant="contained"
                  onClick={() => {
                    setMode("list");
                    setCustomNodeToSaveIndex(null);
                  }}
                >
                  Return to list
                </Button>

                <Button
                  variant="contained"
                  disabled={!customApikey || !url}
                  onClick={() => saveCustomNodes(customNodes)}
                  autoFocus
                >
                  Save
                </Button>
              </>
            )}
          </DialogActions>
        </Dialog>
      )}
    </>
  );
};
