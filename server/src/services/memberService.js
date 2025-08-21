// src/services/memberService.js
import prisma from "../prismaClient.js";

function httpError(message, status = 400) {
  const e = new Error(message);
  e.status = status;
  return e;
}

async function ensureProject(projectId) {
  const project = await prisma.project.findUnique({ where: { id: projectId } });
  if (!project) throw httpError("Project not found", 404);
  return project;
}

export async function addMemberToProject(projectId, actingUserId, { userId, email }) {
  const project = await ensureProject(projectId);
  if (project.ownerId !== actingUserId) throw httpError("Not authorized", 403);

  // Resolve target user by email or id
  let targetUser = null;
  if (email) targetUser = await prisma.user.findUnique({ where: { email } });
  if (!targetUser && userId) targetUser = await prisma.user.findUnique({ where: { id: userId } });
  if (!targetUser) throw httpError("User not found", 404);

  if (targetUser.id === project.ownerId) {
    throw httpError("Owner is already part of the project", 409);
  }

  // Is already a member?
  const existing = await prisma.projectMember.findUnique({
    where: { userId_projectId: { userId: targetUser.id, projectId } },
  });
  if (existing) throw httpError("User is already a member of this project", 409);

  const member = await prisma.projectMember.create({
    data: { userId: targetUser.id, projectId },
    include: {
      user: { select: { id: true, name: true, email: true, avatarUrl: true } },
    },
  });

  return member;
}

export async function listProjectMembers(projectId, actingUserId) {
  const project = await ensureProject(projectId);
  // Allow owner or existing member to view
  const isOwner = project.ownerId === actingUserId;
  const isMember = await prisma.projectMember.findUnique({
    where: { userId_projectId: { userId: actingUserId, projectId } },
  });
  if (!isOwner && !isMember) throw httpError("Not authorized", 403);

  const owner = await prisma.user.findUnique({
    where: { id: project.ownerId },
    select: { id: true, name: true, email: true, avatarUrl: true },
  });

  const members = await prisma.projectMember.findMany({
    where: { projectId },
    include: {
      user: { select: { id: true, name: true, email: true, avatarUrl: true } },
    },
    orderBy: { userId: "asc" },
  });

  // Return a simple shape (owner + members)
  return {
    owner,
    members: members.map((m) => m.user),
  };
}

export async function removeMemberFromProject(projectId, actingUserId, memberUserId) {
  const project = await ensureProject(projectId);
  if (project.ownerId !== actingUserId) throw httpError("Not authorized", 403);

  if (memberUserId === project.ownerId) {
    throw httpError("Cannot remove the project owner", 400);
  }

  const existing = await prisma.projectMember.findUnique({
    where: { userId_projectId: { userId: memberUserId, projectId } },
  });
  if (!existing) throw httpError("Member not found in this project", 404);

  await prisma.projectMember.delete({
    where: { userId_projectId: { userId: memberUserId, projectId } },
  });

  return { success: true };
}
