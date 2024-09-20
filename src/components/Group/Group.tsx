import {
  Avatar,
  Box,
  Button,
  Grid,
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
import AnnouncementsIcon from "@mui/icons-material/Notifications";
import GroupIcon from "@mui/icons-material/Group";
import PersonIcon from "@mui/icons-material/Person";

import {
  AuthenticatedContainerInnerRight,
  CustomButton,
} from "../../App-styles";
import ForumIcon from "@mui/icons-material/Forum";
import { Spacer } from "../../common/Spacer";
import PeopleIcon from "@mui/icons-material/People";
import { ManageMembers } from "./ManageMembers";
import MarkChatUnreadIcon from "@mui/icons-material/MarkChatUnread";
import {
  MyContext,
  clearAllQueues,
  getArbitraryEndpointReact,
  getBaseApiReact,
  isMobile,
  pauseAllQueues,
  resumeAllQueues,
} from "../../App";
import { ChatDirect } from "../Chat/ChatDirect";
import { CustomizedSnackbars } from "../Snackbar/Snackbar";
import { LoadingButton } from "@mui/lab";
import { LoadingSnackbar } from "../Snackbar/LoadingSnackbar";
import { GroupAnnouncements } from "../Chat/GroupAnnouncements";
import HomeIcon from "@mui/icons-material/Home";
import CloseIcon from "@mui/icons-material/Close";

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
import { useMessageQueue } from "../../MessageQueueContext";
import { DrawerComponent } from "../Drawer/Drawer";
import { isExtMsg } from "../../background";
import { ContextMenu } from "../ContextMenu";
import { MobileFooter } from "../Mobile/MobileFooter";
import Header from "../Mobile/MobileHeader";
import { Home } from "./Home";
import { GroupMenu } from "./GroupMenu";
import { getRootHeight } from "../../utils/mobile/mobileUtils";

// let touchStartY = 0;
// let disablePullToRefresh = false;

// // Detect when the user touches the screen
// window.addEventListener('touchstart', function(event) {
//     if (event.touches.length !== 1) return; // Ignore multi-touch events

//     touchStartY = event.touches[0].clientY;
//     disablePullToRefresh = window.scrollY === 0; // Only disable if at the top
// });

// // Detect when the user moves their finger on the screen
// window.addEventListener('touchmove', function(event) {
//     let touchY = event.touches[0].clientY;

//     // If pulling down from the top of the page, prevent the default behavior
//     if (disablePullToRefresh && touchY > touchStartY) {
//         event.preventDefault();
//     }
// });

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

const audio = new Audio(chrome.runtime?.getURL("msg-not1.wav"));

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

export const decryptResource = async (data: string) => {
  try {
    return new Promise((res, rej) => {
      chrome?.runtime?.sendMessage(
        {
          action: "decryptGroupEncryption",
          payload: {
            data,
          },
        },
        (response) => {
          if (!response?.error) {
            res(response);
            return
          }
          rej(response.error);
        }
      );
    });
  } catch (error) {}
};

export const addDataPublishesFunc = async (data: string, groupId, type) => {
  try {
    return new Promise((res, rej) => {
      chrome?.runtime?.sendMessage(
        {
          action: "addDataPublishes",
          payload: {
            data,
            groupId,
            type
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

export const getDataPublishesFunc = async (groupId, type) => {
  try {
    return new Promise((res, rej) => {
      chrome?.runtime?.sendMessage(
        {
          action: "getDataPublishes",
          payload: {
            groupId,
            type
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
  let membersAddresses = [];
  let both = [];
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
        both.push({ name, address: member.member });
      }
      membersAddresses.push(member.member);
    }

    return true;
  });
  await Promise.all(getMemNames);

  return { names: members, addresses: membersAddresses, both };
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
  isOpenDrawerProfile,
  setIsOpenDrawerProfile,
  logoutFunc
}: GroupProps) => {
  const [secretKey, setSecretKey] = useState(null);
  const [secretKeyPublishDate, setSecretKeyPublishDate] = useState(null);
  const lastFetchedSecretKey = useRef(null);
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
  const [isLoadingGroups, setIsLoadingGroups] = React.useState(true);
  const [isLoadingGroup, setIsLoadingGroup] = React.useState(false);
  const [firstSecretKeyInCreation, setFirstSecretKeyInCreation] =
    React.useState(false);
  const [groupSection, setGroupSection] = React.useState("home");
  const [groupAnnouncements, setGroupAnnouncements] = React.useState({});
  const [defaultThread, setDefaultThread] = React.useState(null);
  const [isOpenDrawer, setIsOpenDrawer] = React.useState(false);
  const [hideCommonKeyPopup, setHideCommonKeyPopup] = React.useState(false)
  const [isLoadingGroupMessage, setIsLoadingGroupMessage] = React.useState('')
  const [drawerMode, setDrawerMode] = React.useState("groups");
  const [mutedGroups, setMutedGroups] = useState([])
  const [mobileViewMode, setMobileViewMode] = useState('home')
  const [mobileViewModeKeepOpen, setMobileViewModeKeepOpen] = useState('')

  const isFocusedRef = useRef(true);
  const selectedGroupRef = useRef(null);
  const selectedDirectRef = useRef(null);
  const groupSectionRef = useRef(null);
  const checkGroupInterval = useRef(null);
  const isLoadingOpenSectionFromNotification = useRef(false);
  const setupGroupWebsocketInterval = useRef(null);
  const settimeoutForRefetchSecretKey = useRef(null);
  const { clearStatesMessageQueueProvider } = useMessageQueue();
  const initiatedGetMembers = useRef(false);
  // useEffect(()=> {
  //   setFullHeight()
  // }, [])

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

  const getUserSettings = async () => {
    try {
      return new Promise((res, rej) => {
        chrome?.runtime?.sendMessage(
          {
            action: "getUserSettings",
            payload: {
                key: 'mutedGroups'
            }
          },
          (response) => {
            if (!response?.error) {
               
                setMutedGroups(response || []);
              res(response);
              return
            }
            rej(response.error);
          }
        );
      });
    } catch (error) {
        console.log('error', error)
    }
  };

  useEffect(()=> {
  
    getUserSettings()
  }, [])

  const getTimestampEnterChat = async () => {
    try {
      return new Promise((res, rej) => {
        chrome?.runtime?.sendMessage(
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
  const getGroupDataSingle = async (groupId) => {
    try {
      return new Promise((res, rej) => {
        chrome?.runtime?.sendMessage(
          {
            action: "getGroupDataSingle",
            payload: {
              groupId,
            },
          },
          (response) => {
            if (!response?.error) {
              res(response);
              return;
            }
            rej(response.error);
          }
        );
      });
    } catch (error) {
      return {};
    }
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
        chrome?.runtime?.sendMessage(
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

  const groupChatHasUnread = useMemo(() => {
    let hasUnread = false;
    groups.forEach((group) => {
      if (
        group?.data &&
        isExtMsg(group?.data) &&
        group?.sender !== myAddress &&
        group?.timestamp &&
        ((!timestampEnterData[group?.groupId] &&
          Date.now() - group?.timestamp < timeDifferenceForNotificationChats) ||
          timestampEnterData[group?.groupId] < group?.timestamp)
      ) {
        hasUnread = true;
      }
    });
    return hasUnread;
  }, [timestampEnterData, groups, myAddress]);

  const groupsAnnHasUnread = useMemo(() => {
    let hasUnread = false;
    groups.forEach((group) => {
      if (
        groupAnnouncements[group?.groupId] &&
        !groupAnnouncements[group?.groupId]?.seentimestamp
      ) {
        hasUnread = true;
      }
    });
    return hasUnread;
  }, [groupAnnouncements, groups]);

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
    const url = `${getBaseApiReact()}${getArbitraryEndpointReact()}?mode=ALL&service=DOCUMENT_PRIVATE&identifier=symmetric-qchat-group-${
      selectedGroup?.groupId
    }&exactmatchnames=true&limit=0&reverse=true&${queryString}&prefix=true`;
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error("network error");
    }
    const adminData = await response.json();

    const filterId = adminData.filter(
      (data: any) =>
        data.identifier === `symmetric-qchat-group-${selectedGroup?.groupId}`
    );
    if (filterId?.length === 0) {
      return false;
    }
    const sortedData = filterId.sort((a: any, b: any) => {
      // Get the most recent date for both a and b
      const dateA = a.updated ? new Date(a.updated) : new Date(a.created);
      const dateB = b.updated ? new Date(b.updated) : new Date(b.created);

      // Sort by most recent
      return dateB.getTime() - dateA.getTime();
    });

    return sortedData[0];
  };
  const getSecretKey = async (
    loadingGroupParam?: boolean,
    secretKeyToPublish?: boolean
  ) => {
    try {
      setIsLoadingGroupMessage('Locating encryption keys')
      // setGroupDataLastSet(null)
      pauseAllQueues();
      let dataFromStorage;
      let publishFromStorage;
      let adminsFromStorage;
      // const groupData = await getGroupDataSingle(selectedGroup?.groupId);
      // if (
      //   groupData?.secretKeyData &&
      //   Date.now() - groupData?.timestampLastSet < 3600000
      // ) {
      //   dataFromStorage = groupData.secretKeyData;
      //   publishFromStorage = groupData.secretKeyResource;
      //   adminsFromStorage = groupData.admins;
      //   // setGroupDataLastSet(groupData.timestampLastSet)
      // }

      if (
        secretKeyToPublish &&
        secretKey &&
        lastFetchedSecretKey.current &&
        Date.now() - lastFetchedSecretKey.current < 1800000
      )
        return secretKey;
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
      const { names, addresses, both } =
        adminsFromStorage || (await getGroupAdimns(selectedGroup?.groupId));
      setAdmins(addresses);
      setAdminsWithNames(both);
      if (!names.length) {
        throw new Error("Network error");
      }
      const publish =
        publishFromStorage || (await getPublishesFromAdmins(names));

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
        return false;
      }
      setSecretKeyPublishDate(publish?.updated || publish?.created);
      let data;
      if (dataFromStorage) {
        data = dataFromStorage;
      } else {
        setIsLoadingGroupMessage('Downloading encryption keys')
        const res = await fetch(
          `${getBaseApiReact()}/arbitrary/DOCUMENT_PRIVATE/${publish.name}/${
            publish.identifier
          }?encoding=base64`
        );
        data = await res.text();
      }

      const decryptedKey: any = await decryptResource(data);

      const dataint8Array = base64ToUint8Array(decryptedKey.data);
      const decryptedKeyToObject = uint8ArrayToObject(dataint8Array);

      if (!validateSecretKey(decryptedKeyToObject))
        throw new Error("SecretKey is not valid");
      setSecretKeyDetails(publish);
      setSecretKey(decryptedKeyToObject);
      lastFetchedSecretKey.current = Date.now();
      setMemberCountFromSecretKeyData(decryptedKey.count);
      chrome?.runtime?.sendMessage({
        action: "setGroupData",
        payload: {
          groupId: selectedGroup?.groupId,
          secretKeyData: data,
          secretKeyResource: publish,
          admins: { names, addresses, both },
        },
      });
      if (decryptedKeyToObject) {
        setTriedToFetchSecretKey(true);
        setFirstSecretKeyInCreation(false);
        return decryptedKeyToObject;
      } else {
        setTriedToFetchSecretKey(true);
      }
    } catch (error) {
      if (error === "Unable to decrypt data") {
        setTriedToFetchSecretKey(true);
        settimeoutForRefetchSecretKey.current = setTimeout(() => {
          getSecretKey();
        }, 120000);
      }
    } finally {
      setIsLoadingGroup(false);
      setIsLoadingGroupMessage('')
      if (!secretKeyToPublish) {
        // await getAdmins(selectedGroup?.groupId);
      }
      resumeAllQueues();
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
  //       chrome?.runtime?.sendMessage(
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
  //         chrome?.runtime?.sendMessage(
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
  //       chrome?.runtime?.sendMessage(
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

  //       chrome?.runtime?.sendMessage(
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
    chrome?.runtime?.onMessage.addListener((message, sender, sendResponse) => {
      if (message.action === "SET_GROUPS") {
        // Update the component state with the received 'sendqort' state
        setGroups(message.payload);

        setMemberGroups(message.payload);

        if (selectedGroupRef.current && groupSectionRef.current === "chat") {
          chrome?.runtime?.sendMessage({
            action: "addTimestampEnterChat",
            payload: {
              timestamp: Date.now(),
              groupId: selectedGroupRef.current.groupId,
            },
          });
        }
        if (selectedDirectRef.current) {
          chrome?.runtime?.sendMessage({
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
          chrome?.runtime?.sendMessage({
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
        //   chrome?.runtime?.sendMessage({
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

    chrome?.runtime?.sendMessage({ action: "setupGroupWebsocket" });

    hasInitializedWebsocket.current = true;
  }, [myAddress, groups]);

  const getMembers = async (groupId) => {
    try {
      const res = await getGroupMembers(groupId);
      if (groupId !== selectedGroupRef.current?.groupId) return;
      setMembers(res);
    } catch (error) {}
  };
  useEffect(() => {
    if (
      !initiatedGetMembers.current &&
      selectedGroup?.groupId &&
      secretKey &&
      admins.includes(myAddress)
    ) {
     
      // getAdmins(selectedGroup?.groupId);
      getMembers(selectedGroup?.groupId);
      initiatedGetMembers.current = true;
    }
  }, [selectedGroup?.groupId, secretKey, myAddress, admins]);

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
        chrome?.runtime?.sendMessage(
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
    if (!findGroup?.data || !isExtMsg(findGroup?.data)) return false;
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
      // setSelectedGroup(null);

      setNewChat(false);

      chrome?.runtime?.sendMessage({
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

  const openDirectChatFromInternal = (e) => {
    const directAddress = e.detail?.address;
    const name = e.detail?.name
    const findDirect = directs?.find(
      (direct) => direct?.address === directAddress || direct?.name === name
    );
    
    if (findDirect) {
      setChatMode("directs");
      setSelectedDirect(null);
      // setSelectedGroup(null);

      setNewChat(false);

      chrome?.runtime?.sendMessage({
        action: "addTimestampEnterChat",
        payload: {
          timestamp: Date.now(),
          groupId: findDirect.address,
        },
      });

      setTimeout(() => {
        setSelectedDirect(findDirect);
        getTimestampEnterChat();
      }, 200);

    } else {
      setChatMode('directs')
      setNewChat(true);
      setTimeout(() => {
      executeEvent("setDirectToValueNewChat", {
        directToValue: name || directAddress
      });
    }, 500);
    }
  };

  useEffect(() => {
    subscribeToEvent("openDirectMessageInternal", openDirectChatFromInternal);

    return () => {
      unsubscribeFromEvent("openDirectMessageInternal", openDirectChatFromInternal);
    };
  }, [directs, selectedDirect]);

  useEffect(() => {
    subscribeToEvent("openDirectMessage", openDirectChatFromNotification);

    return () => {
      unsubscribeFromEvent("openDirectMessage", openDirectChatFromNotification);
    };
  }, [directs, selectedDirect]);

  const handleMarkAsRead = (e)=> {
    const {groupId} = e.detail
    chrome?.runtime?.sendMessage({
      action: "addTimestampEnterChat",
      payload: {
        timestamp: Date.now(),
        groupId,
      },
    });

   

    chrome?.runtime?.sendMessage({
      action: "addGroupNotificationTimestamp",
      payload: {
        timestamp: Date.now(),
        groupId,
      },
    });
    setTimeout(() => {
      getGroupAnnouncements();
      getTimestampEnterChat();
    }, 200);
  }


  useEffect(() => {
    subscribeToEvent("markAsRead", handleMarkAsRead);

    return () => {
      unsubscribeFromEvent("markAsRead", handleMarkAsRead);
    };
  }, []);


  const resetAllStatesAndRefs = () => {
    // Reset all useState values to their initial states
    setSecretKey(null);
    lastFetchedSecretKey.current = null;
    setSecretKeyPublishDate(null);
    setSecretKeyDetails(null);
    setNewEncryptionNotification(null);
    setMemberCountFromSecretKeyData(null);
    setSelectedGroup(null);
    setSelectedDirect(null);
    setGroups([]);
    setDirects([]);
    setAdmins([]);
    setAdminsWithNames([]);
    setMembers([]);
    setGroupOwner(null);
    setTriedToFetchSecretKey(false);
    setHideCommonKeyPopup(false)
    setOpenAddGroup(false);
    setIsInitialGroups(false);
    setOpenManageMembers(false);
    setMemberGroups([]); // Assuming you're clearing the context here as well
    setTimestampEnterData({});
    setChatMode("groups");
    setNewChat(false);
    setOpenSnack(false);
    setInfoSnack(null);
    setIsLoadingNotifyAdmin(false);
    setIsLoadingGroups(false);
    setIsLoadingGroup(false);
    setFirstSecretKeyInCreation(false);
    setGroupSection("home");
    setGroupAnnouncements({});
    setDefaultThread(null);
    setMobileViewMode('home')
    // Reset all useRef values to their initial states
    hasInitialized.current = false;
    hasInitializedWebsocket.current = false;
    lastGroupNotification.current = null;
    isFocusedRef.current = true;
    selectedGroupRef.current = null;
    selectedDirectRef.current = null;
    groupSectionRef.current = null;
    checkGroupInterval.current = null;
    isLoadingOpenSectionFromNotification.current = false;
    setupGroupWebsocketInterval.current = null;
    settimeoutForRefetchSecretKey.current = null;
    initiatedGetMembers.current = false;
  };

  const logoutEventFunc = () => {
    resetAllStatesAndRefs();
    clearStatesMessageQueueProvider();
  };

  useEffect(() => {
    subscribeToEvent("logout-event", logoutEventFunc);

    return () => {
      unsubscribeFromEvent("logout-event", logoutEventFunc);
    };
  }, []);
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
      lastFetchedSecretKey.current = null;
      setSecretKeyPublishDate(null);
      setAdmins([]);
      setSecretKeyDetails(null);
      setAdminsWithNames([]);
      setMembers([]);
      setMemberCountFromSecretKeyData(null);
      setTriedToFetchSecretKey(false);
      setFirstSecretKeyInCreation(false);
      setGroupSection("chat");

      chrome?.runtime?.sendMessage({
        action: "addTimestampEnterChat",
        payload: {
          timestamp: Date.now(),
          groupId: findGroup.groupId,
        },
      });

      setTimeout(() => {
        setSelectedGroup(findGroup);
        setMobileViewMode('group')
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
      lastFetchedSecretKey.current = null;
      setSecretKeyPublishDate(null);
      setAdmins([]);
      setSecretKeyDetails(null);
      setAdminsWithNames([]);
      setMembers([]);
      setMemberCountFromSecretKeyData(null);
      setTriedToFetchSecretKey(false);
      setFirstSecretKeyInCreation(false);
      setGroupSection("announcement");
      chrome?.runtime?.sendMessage({
        action: "addGroupNotificationTimestamp",
        payload: {
          timestamp: Date.now(),
          groupId: findGroup.groupId,
        },
      });
      setTimeout(() => {
        setSelectedGroup(findGroup);
        setMobileViewMode('group')

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
      lastFetchedSecretKey.current = null;
      setSecretKeyPublishDate(null);
      setAdmins([]);
      setSecretKeyDetails(null);
      setAdminsWithNames([]);
      setMembers([]);
      setMemberCountFromSecretKeyData(null);
      setTriedToFetchSecretKey(false);
      setFirstSecretKeyInCreation(false);
      setGroupSection("forum");
      setDefaultThread(data);

      setTimeout(() => {
        setSelectedGroup(findGroup);
        setMobileViewMode('group')
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

  const handleSecretKeyCreationInProgress = () => {
    setFirstSecretKeyInCreation(true);
  };

  const goToHome = async () => {
    if(isMobile){
      setMobileViewMode('home')
    }
    if(!isMobile){

    }
    setGroupSection("default");
    clearAllQueues();
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
    lastFetchedSecretKey.current = null;
    setSecretKeyPublishDate(null);
    setAdmins([]);
    setSecretKeyDetails(null);
    setAdminsWithNames([]);
    setMembers([]);
    setMemberCountFromSecretKeyData(null);
    setTriedToFetchSecretKey(false);
    setFirstSecretKeyInCreation(false);
  };

  const goToAnnouncements = async () => {
    setGroupSection("default");
    await new Promise((res) => {
      setTimeout(() => {
        res(null);
      }, 200);
    });
    setSelectedDirect(null);
    setNewChat(false)
    setGroupSection("announcement");
    chrome?.runtime?.sendMessage({
      action: "addGroupNotificationTimestamp",
      payload: {
        timestamp: Date.now(),
        groupId: selectedGroupRef.current.groupId,
      },
    });
    setTimeout(() => {
      getGroupAnnouncements();
    }, 200);
  };

  const openDrawerGroups = ()=> {
    setIsOpenDrawer(true);
            setDrawerMode("groups");
  }

  const goToThreads = ()=> {
    setSelectedDirect(null);
    setNewChat(false)
     setGroupSection("forum")
  }

  const goToChat = async () => {
    setGroupSection("default");
    await new Promise((res) => {
      setTimeout(() => {
        res(null);
      }, 200);
    });
    setGroupSection("chat");
    setNewChat(false)
    setSelectedDirect(null);
    if (selectedGroupRef.current) {
      chrome?.runtime?.sendMessage({
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
  };


  const renderDirects = ()=> {
    return (
      <div
        style={{
          display: "flex",
          width: isMobile ? '100%' : "300px",
          flexDirection: "column",
          alignItems: "flex-start",
          height: isMobile ? `calc(${getRootHeight()} - 30px)` : "100%"
        }}
      >
         <div
          style={{
            display: "flex",
            width: "100%",
            flexDirection: "column",
            alignItems: "flex-start",
            flexGrow: 1,
            overflowY: "auto",
            // visibility: chatMode === "groups" && "hidden",
            // position: chatMode === "groups" && "fixed",
            // left: chatMode === "groups" && "-1000px",
          }}
        >
          {directs.map((direct: any) => (
            <List sx={{
              width: '100%'
            }} className="group-list" dense={true}>
              <ListItem
                //   secondaryAction={
                //     <IconButton edge="end" aria-label="delete">
                //       <SettingsIcon />
                //     </IconButton>
                //   }
                onClick={() => {
                  setSelectedDirect(null);
                  setNewChat(false);
                  // setSelectedGroup(null);
                  setIsOpenDrawer(false);
                  chrome?.runtime?.sendMessage({
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
                    alignItems: 'center'
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
            width: "100%",
            justifyContent: "center",
            padding: "10px",
          }}
        >
         
            <CustomButton
              onClick={() => {
                setNewChat(true);
                setSelectedDirect(null);
                // setSelectedGroup(null);
                setIsOpenDrawer(false);
              }}
            >
              <CreateIcon
                sx={{
                  color: "white",
                }}
              />
              New Chat
            </CustomButton>

        </div>
      </div>
    )
  }

  const renderGroups = () => {
    return (
      <div
        style={{
          display: "flex",
          width: isMobile ? '100%' : "300px",
          flexDirection: "column",
          alignItems: "flex-start",
          height: isMobile ? 'calc(100% - 30px)' : "100%"
        }}
      >
        
        {/* <div
          style={{
            display: "flex",
            width: "100%",
            justifyContent: "center",
            gap: "20px",
            padding: "10px",
            flexDirection: "column",
          }}
        >
          {isMobile && (
            <Box
              sx={{
                width: "100%",
                display: "flex",
                justifyContent: "flex-end",
              }}
            >
              <CloseIcon
                onClick={() => {
                  setIsOpenDrawer(false);
                }}
                sx={{
                  cursor: "pointer",
                  color: "white",
                }}
              />
            </Box>
          )}
          <CustomButton
            onClick={() => {
              setChatMode((prev) =>
                prev === "directs" ? "groups" : "directs"
              );
              
            }}
            sx={{
              backgroundColor: chatMode === 'directs' && ( groupChatHasUnread || groupsAnnHasUnread) ? 'red' : 'revert'
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
        </div> */}
        {/* <div
          style={{
            display: "flex",
            width: "100%",
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
            <List sx={{
              width: '100%'
            }} className="group-list" dense={true}>
              <ListItem
                //   secondaryAction={
                //     <IconButton edge="end" aria-label="delete">
                //       <SettingsIcon />
                //     </IconButton>
                //   }
                onClick={() => {
                  setSelectedDirect(null);
                  setNewChat(false);
                  // setSelectedGroup(null);
                  setIsOpenDrawer(false);
                  chrome?.runtime?.sendMessage({
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
        </div> */}
        <div
          style={{
            display: "flex",
            width: "100%",
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
            <List sx={{
              width: '100%'
            }} className="group-list" dense={true}>
              <ListItem
                //   secondaryAction={
                //     <IconButton edge="end" aria-label="delete">
                //       <SettingsIcon />
                //     </IconButton>
                //   }
                onClick={() => {
                  setMobileViewMode('group')
                  clearAllQueues();
                  setSelectedDirect(null);
                  setTriedToFetchSecretKey(false);
                  setNewChat(false);
                  setSelectedGroup(null);
                  setSecretKey(null);
                  lastFetchedSecretKey.current = null;
                  setSecretKeyPublishDate(null);
                  setAdmins([]);
                  setSecretKeyDetails(null);
                  setAdminsWithNames([]);
                  setMembers([]);
                  setMemberCountFromSecretKeyData(null);
                  setHideCommonKeyPopup(false);
                  setFirstSecretKeyInCreation(false);
                  // setGroupSection("announcement");
                  setGroupSection("chat");
                  setIsOpenDrawer(false);
                  setTimeout(() => {
                    setSelectedGroup(group);

                    // getTimestampEnterChat();
                  }, 200);

                  chrome?.runtime?.sendMessage({
                    action: "addTimestampEnterChat",
                    payload: {
                      timestamp: Date.now(),
                      groupId: group.groupId,
                    },
                  });

                  setTimeout(() => {
                    getTimestampEnterChat();
                  }, 200);

                  // if (groupSectionRef.current === "announcement") {
                  //   chrome?.runtime?.sendMessage({
                  //     action: "addGroupNotificationTimestamp",
                  //     payload: {
                  //       timestamp: Date.now(),
                  //       groupId: group.groupId,
                  //     },
                  //   });
                  // }

                  // setTimeout(() => {
                  //   getGroupAnnouncements();
                  // }, 600);
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
                <ContextMenu mutedGroups={mutedGroups} getUserSettings={getUserSettings} groupId={group.groupId}>
                <Box
                  sx={{
                    display: "flex",
                    width: "100%",
                    alignItems: 'center'
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
                          group?.groupId === selectedGroup?.groupId && "black",
                      },
                    }} // Change the color of the primary text
                    secondaryTypographyProps={{
                      style: {
                        color:
                          group?.groupId === selectedGroup?.groupId && "black",
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
                  {group?.data &&
                    isExtMsg(group?.data) &&
                    group?.sender !== myAddress &&
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
                </ContextMenu>
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
                // setSelectedGroup(null);
                setIsOpenDrawer(false);
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
    );
  };

  return (
    <>
      <WebSocketActive
        myAddress={myAddress}
        setIsLoadingGroups={setIsLoadingGroups}
      />
      <CustomizedSnackbars
        open={openSnack}
        setOpen={setOpenSnack}
        info={infoSnack}
        setInfo={setInfoSnack}
      />
      <Header setMobileViewModeKeepOpen={setMobileViewModeKeepOpen} isThin={mobileViewMode === 'groups' || mobileViewMode === 'group' || mobileViewModeKeepOpen === 'messaging'} logoutFunc={logoutFunc} goToHome={goToHome} setIsOpenDrawerProfile={setIsOpenDrawerProfile} />
     
      <div
        style={{
          display: "flex",
          width: "100%",
          height: isMobile ? "100%" : "100%",
          flexDirection: "row",
          alignItems: "flex-start",
        }}
      >
        {!isMobile && renderGroups()}
        <Box sx={{
          width: '100%',
          height: '100%',
          position: 'relative'
        }}>
        <AddGroup
          address={myAddress}
          open={openAddGroup}
          setOpen={setOpenAddGroup}
        />

        {mobileViewMode === 'groups' && (
          renderGroups()
        )}

{mobileViewModeKeepOpen === 'messaging' && (
          renderDirects()
        )}
        {newChat && (
          <>
           <Box
              sx={{
                position: "absolute",
                left: '0px',
                right: '0px',
                bottom: '0px',
                top: '0px',
                background: '#27282c',
                zIndex: 5,
                height: isMobile && 'calc(100% - 30px)'
              }}
            >
            <ChatDirect
              myAddress={myAddress}
              myName={userInfo?.name}
              isNewChat={newChat}
              selectedDirect={undefined}
              setSelectedDirect={setSelectedDirect}
              setNewChat={setNewChat}
              getTimestampEnterChat={getTimestampEnterChat}
              balance={balance}
              close={()=> {
                setSelectedDirect(null);

                setNewChat(false);
              }}
            />
            </Box>
          </>
        )}
        {selectedGroup  && (
          <>
           {mobileViewMode === 'group' && (
        <GroupMenu       setGroupSection={setGroupSection} groupSection={groupSection}
        />
      )}
            <Box
              sx={{
                position: "relative",
                flexGrow: 1,
                display: "flex",
                height: isMobile ? 'calc(100% - 53px)' : "100%",

              }}
            >
              {triedToFetchSecretKey && (
                <ChatGroup
                  myAddress={myAddress}
                  selectedGroup={selectedGroup?.groupId}
                  getSecretKey={getSecretKey}
                  secretKey={secretKey}
                  setSecretKey={setSecretKey}
                  handleNewEncryptionNotification={setNewEncryptionNotification}
                  hide={groupSection !== "chat" || !secretKey}
                  handleSecretKeyCreationInProgress={
                    handleSecretKeyCreationInProgress
                  }
                  triedToFetchSecretKey={triedToFetchSecretKey}
                  myName={userInfo?.name}
                  balance={balance}
                />
              )}
              {firstSecretKeyInCreation &&
                triedToFetchSecretKey &&
                !secretKeyPublishDate && (
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
                      The group's first common encryption key is in the process
                      of creation. Please wait a few minutes for it to be
                      retrieved by the network. Checking every 2 minutes...
                    </Typography>
                  </div>
                )}
              {!admins.includes(myAddress) &&
              !secretKey &&
              triedToFetchSecretKey ? (
                <>
                  {secretKeyPublishDate ||
                  (!secretKeyPublishDate && !firstSecretKeyInCreation) ? (
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
                  triedToFetchSecretKey &&
                  !firstSecretKeyInCreation && !hideCommonKeyPopup && (
                    <CreateCommonSecret
                    setHideCommonKeyPopup={setHideCommonKeyPopup}
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
          </>
        )}

        {selectedDirect && !newChat && (
          <>
          <Box
              sx={{
                position: "absolute",
                left: '0px',
                right: '0px',
                bottom: '0px',
                top: '0px',
                background: '#27282c',
                zIndex: 5,
                height: isMobile && 'calc(100% - 30px)'
              }}
            >

           
         
            <Box
              sx={{
                position: "relative",
                flexGrow: 1,
                display: "flex",
                height: "100%",
                
              }}
            >
             
              <ChatDirect
                myAddress={myAddress}
                isNewChat={newChat}
                selectedDirect={selectedDirect}
                setSelectedDirect={setSelectedDirect}
                setNewChat={setNewChat}
                getTimestampEnterChat={getTimestampEnterChat}
                myName={userInfo?.name}
                close={()=> {
                  setSelectedDirect(null);

                  setNewChat(false);
                }}
              />
            </Box>
            </Box>
          </>
        )}

        {mobileViewMode === 'home' && (
          <Home
          refreshHomeDataFunc={refreshHomeDataFunc}
          myAddress={myAddress}
          isLoadingGroups={isLoadingGroups}
          balance={balance}
          userInfo={userInfo}
          groups={groups}
          setGroupSection={setGroupSection}
          setSelectedGroup={setSelectedGroup}
          getTimestampEnterChat={getTimestampEnterChat}
          setOpenManageMembers={setOpenManageMembers}
          setOpenAddGroup={setOpenAddGroup}
          setMobileViewMode={setMobileViewMode}
        />
        )}
        {/* {
          !selectedGroup &&
          groupSection === "home" && (
           
<Home
  refreshHomeDataFunc={refreshHomeDataFunc}
  myAddress={myAddress}
  isLoadingGroups={isLoadingGroups}
  balance={balance}
  userInfo={userInfo}
  groups={groups}
  setGroupSection={setGroupSection}
  setSelectedGroup={setSelectedGroup}
  getTimestampEnterChat={getTimestampEnterChat}
  setOpenManageMembers={setOpenManageMembers}
  setOpenAddGroup={setOpenAddGroup}
/>
          )} */}
           </Box>
        <AuthenticatedContainerInnerRight
          sx={{
            marginLeft: "auto",
            width: "135px",
            minWidth: "135px",
            padding: "5px",
            display: isMobile ? "none" : "flex",
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
              cursor: "pointer",
            }}
            onClick={goToHome}
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
          {selectedGroup && (
            <>
              <Spacer height="20px" />
              <Box
                sx={{
                  display: "flex",
                  gap: "3px",
                  alignItems: "center",
                  justifyContent: "flex-start",
                  width: "100%",
                  cursor: "pointer",
                }}
                onClick={goToAnnouncements}
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
                  cursor: "pointer",
                }}
                onClick={goToChat}
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
                  cursor: "pointer",
                }}
                onClick={() => {
                  setGroupSection("forum");
                  setSelectedDirect(null);
                  setNewChat(false)
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
                  cursor: "pointer",
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
            </>
          )}

          {/* <SettingsIcon
              sx={{
                cursor: "pointer",
                color: "white",
              }}
            /> */}
        </AuthenticatedContainerInnerRight>
        <LoadingSnackbar
          open={isLoadingGroup}
          info={{
            message: isLoadingGroupMessage || "Setting up group... please wait.",
          }}
        />

        <LoadingSnackbar
          open={isLoadingGroups}
          info={{
            message: "Setting up groups... please wait.",
          }}
        />
       
      </div>
      {mobileViewMode === 'home' && !mobileViewModeKeepOpen && (
        <>
        <div style={{
        height: '66px',
        width: '100%',
        backgroundColor: 'var(--bg-primary)',
        borderTopRightRadius: '25px',
        borderTopLeftRadius: '25px'
      }} />
      {/* <DrawerComponent open={isOpenDrawer} setOpen={setIsOpenDrawer}>
        {renderGroups()}
      </DrawerComponent> */}
      {isMobile && (
         <MobileFooter selectedGroup={selectedGroup} groupSection={groupSection} isUnread={isUnread} goToAnnouncements={goToAnnouncements} isUnreadChat={isUnreadChat} goToChat={goToChat} goToThreads={goToThreads} setOpenManageMembers={setOpenManageMembers} groupChatHasUnread={groupChatHasUnread} groupsAnnHasUnread={groupsAnnHasUnread} directChatHasUnread={directChatHasUnread} chatMode={chatMode} openDrawerGroups={openDrawerGroups} goToHome={goToHome} setIsOpenDrawerProfile={setIsOpenDrawerProfile} 
         mobileViewMode={mobileViewMode} setMobileViewMode={setMobileViewMode} setMobileViewModeKeepOpen={setMobileViewModeKeepOpen}
         />
      )}
        </>
      )}
      
     
     
    </>
  );
};



// {isMobile && (
//   <Box
//     sx={{
//       display: "flex",
//       alignItems: "center",
//       justifyContent: "center",
//       flexDirection: "column",
//       width: "100%",
//       height: "75px", // Keep the height at 75px
//       background: "rgba(0, 0, 0, 0.1)",
//       padding: "0px", // Remove unnecessary padding
//     }}
//   >
//     <Grid
//       container
//       spacing={0.5}
//       sx={{ width: "100%", justifyContent: "space-around" }}
//     >
//       {selectedGroup && (
//         <>
//           <Grid item xs={4} sx={{
//             display: 'flex'
//           }}>
//             <Button
//               fullWidth
//               size="small"
//               variant="contained"
//               startIcon={<AnnouncementsIcon />}
//               sx={{
//                 padding: "4px 6px",
//                 color:
//                   groupSection === "announcement" ? "black" : "white",
//                 backgroundColor: isUnread
//                   ? "red"
//                   : groupSection === "announcement"
//                   ? "white"
//                   : "black",
//                 "&:hover": {
//                   backgroundColor: isUnread
//                     ? "red"
//                     : groupSection === "announcement"
//                     ? "white"
//                     : "black",
//                 },
//                 "&:active": {
//                   backgroundColor: isUnread
//                     ? "red"
//                     : groupSection === "announcement"
//                     ? "white"
//                     : "black",
//                 },
//                 "&:focus": {
//                   backgroundColor: isUnread
//                     ? "red"
//                     : groupSection === "announcement"
//                     ? "white"
//                     : "black",
//                 },
//               }}
//               onClick={goToAnnouncements}
//             >
//               ANN
//             </Button>
//           </Grid>
//           <Grid item xs={4} sx={{
//             display: 'flex'
//           }}>
//             <Button
//               fullWidth
//               size="small"
//               variant="contained"
//               startIcon={<ChatIcon />}
//               sx={{
//                 padding: "4px 6px",
//                 color: groupSection === "chat" ? "black" : "white",
//                 backgroundColor: isUnreadChat
//                   ? "red"
//                   : groupSection === "chat"
//                   ? "white"
//                   : "black",
//                 "&:hover": {
//                   backgroundColor: isUnreadChat
//                     ? "red"
//                     : groupSection === "chat"
//                     ? "white"
//                     : "black", // Same logic for hover
//                 },
//                 "&:active": {
//                   backgroundColor: isUnreadChat
//                     ? "red"
//                     : groupSection === "chat"
//                     ? "white"
//                     : "black", // Same logic for active
//                 },
//                 "&:focus": {
//                   backgroundColor: isUnreadChat
//                     ? "red"
//                     : groupSection === "chat"
//                     ? "white"
//                     : "black", // Same logic for focus
//                 },
//               }}
//               onClick={goToChat}
//             >
//               Chat
//             </Button>
//           </Grid>
//           <Grid item xs={4} sx={{
//             display: 'flex'
//           }}>
//             <Button
//               fullWidth
//               size="small"
//               variant="contained"
//               startIcon={<ForumIcon />}
//               sx={{
//                 padding: "4px 6px",
//                 color: groupSection === "forum" ? "black" : "white",
//                 backgroundColor:
//                   groupSection === "forum" ? "white" : "black",
//                   "&:hover": {
//                     backgroundColor: groupSection === "forum" ? "white" : "black", // Hover state
//                   },
//                   "&:active": {
//                     backgroundColor: groupSection === "forum" ? "white" : "black", // Active state
//                   },
//                   "&:focus": {
//                     backgroundColor: groupSection === "forum" ? "white" : "black", // Focus state
//                   },
//               }}
//               onClick={() => {
//                 setSelectedDirect(null);
//                 setNewChat(false)
//                 setGroupSection("forum")
//               } }
//             >
//               Forum
//             </Button>
//           </Grid>
//           <Grid item xs={4} sx={{
//             display: 'flex'
//           }}>
//             <Button
//               fullWidth
//               size="small"
//               variant="contained"
//               startIcon={<GroupIcon />}
//               sx={{ padding: "4px 6px", backgroundColor: "black",  "&:hover": {
//                 backgroundColor:  "black", // Hover state
//               },
//               "&:active": {
//                 backgroundColor:  "black", // Active state
//               },
//               "&:focus": {
//                 backgroundColor:  "black", // Focus state
//               }, }}
//               onClick={() => setOpenManageMembers(true)}
//             >
//               Members
//             </Button>
//           </Grid>
//         </>
//       )}

//       {/* Second row: Groups, Home, Profile */}
//       <Grid item xs={4} sx={{
//             display: 'flex',
//           }}>
//         <Button
//           fullWidth
//           size="small"
//           variant="contained"
//           startIcon={<GroupIcon />}
//           sx={{
//             padding: "2px 4px",
//             backgroundColor:
//               groupChatHasUnread ||
//               groupsAnnHasUnread ||
//               directChatHasUnread
//                 ? "red"
//                 : "black",
//                 "&:hover": {
//                   backgroundColor:
//                     groupChatHasUnread || groupsAnnHasUnread || directChatHasUnread
//                       ? "red"
//                       : "black", // Hover state follows the same logic
//                 },
//                 "&:active": {
//                   backgroundColor:
//                     groupChatHasUnread || groupsAnnHasUnread || directChatHasUnread
//                       ? "red"
//                       : "black", // Active state follows the same logic
//                 },
//                 "&:focus": {
//                   backgroundColor:
//                     groupChatHasUnread || groupsAnnHasUnread || directChatHasUnread
//                       ? "red"
//                       : "black", // Focus state follows the same logic
//                 },
//           }}
//           onClick={() => {
//             setIsOpenDrawer(true);
//             setDrawerMode("groups");
//           }}
//         >
//           {chatMode === "groups" ? "Groups" : "Direct"}
//         </Button>
//       </Grid>
//       <Grid item xs={2} sx={{
//             display: 'flex',
//             justifyContent: 'center'
//           }}>
//         <IconButton
//           sx={{ padding: "0", color: "white" }} // Reduce padding for icons
//           onClick={goToHome}
//         >
//           <HomeIcon />
//         </IconButton>
//       </Grid>
//       <Grid item xs={2}  sx={{
//             display: 'flex',
//             justifyContent: 'center'
//           }}>
//         <IconButton
//           sx={{ padding: "0", color: "white" }} // Reduce padding for icons
//           onClick={() => setIsOpenDrawerProfile(true)}
//         >
//           <PersonIcon />
//         </IconButton>
//       </Grid>
//     </Grid>
//   </Box>
// )}