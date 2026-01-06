import { Prisma } from "../generated/client";
import prismaClient from "./prismaClient"

export const addInterestedUser = async (user: Prisma.InterestedUserCreateInput) => {
  await prismaClient.interestedUser.create({
    data: user,
  });
};