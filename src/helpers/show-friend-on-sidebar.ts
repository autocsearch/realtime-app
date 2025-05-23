import { fetchRedis } from "@/helpers/redis";

export default async function getFriendsByUserId(userId: string) {
  //retrive  all friends of the user from redis
  const friendIds = (await fetchRedis("smembers", `user:${userId}:friends`)) as string[];
  const friends = await Promise.all(
    friendIds.map(async (friendId) => {
      const friend = (await fetchRedis("get", `user:${friendId}`)) as string;
      const parsedFriend = JSON.parse(friend) as User;
      return parsedFriend;
    })
  );

  return friends;
}
