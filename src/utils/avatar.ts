import { getBaseApiReact } from "../App";

const buildThumbnailUrl = (path?: string | null) => {
  if (!path) return "";
  return `${getBaseApiReact()}${path}`;
};

export const getUserAvatarUrl = (name?: string | null) => {
  if (!name) return "";
  const path = `/arbitrary/THUMBNAIL/${name}/qortal_avatar?async=true`;
  return buildThumbnailUrl(path);
};

export const getGroupAvatarUrl = (
  ownerName?: string | null,
  groupId?: string | number | null
) => {
  if (!ownerName || !groupId) return "";
  const path = `/arbitrary/THUMBNAIL/${ownerName}/qortal_group_avatar_${groupId}?async=true`;
  return buildThumbnailUrl(path);
};
