// src/services/projectService.js
import prisma from "../lib/prisma.js";
import { createNotification } from "./notificationService.js";

export const createProject = async (ownerId, name, description) => {
  return await prisma.project.create({
    data: {
      name,
      description,
      ownerId,
    },
  });
};

export const getUserProjects = async (userId) => {
  return await prisma.project.findMany({
    where: {
      OR: [
        { ownerId: userId },
        { members: { some: { userId } } },
      ],
    },
    include: {
      members: { include: { user: true } },
      tasks: true,
    },
  });
};

export const getProjectById = async (projectId) => {
  return await prisma.project.findUnique({
    where: { id: projectId },
    include: {
      members: { include: { user: true } },
      tasks: true,
    },
  });
};

export const updateProject = async (projectId, userId, data) => {
  const project = await prisma.project.findUnique({ where: { id: projectId } });

  if (!project || project.ownerId !== userId) {
    throw new Error("Not authorized to update this project");
  }

  return await prisma.project.update({
    where: { id: projectId },
    data,
  });
};

export const deleteProject = async (projectId, userId) => {
  const project = await prisma.project.findUnique({ where: { id: projectId } });

  if (!project || project.ownerId !== userId) {
    throw new Error("Not authorized to delete this project");
  }

  return await prisma.project.delete({
    where: { id: projectId },
  });
};

export const addMemberToProject = async (projectId, ownerId, userId) => {
  const project = await prisma.project.findUnique({ where: { id: projectId } });

  if (!project || project.ownerId !== ownerId) {
    throw new Error("Only the owner can add members");
  }

  // ✅ Add the member
  const member = await prisma.projectMember.create({
    data: {
      projectId,
      userId,
    },
  });

  // ✅ Send a notification to the new member
  await createNotification({
    userId,
    type: "project_invite",
    title: "You were added to a project",
    message: `You were added to project "${project.name}"`,
    link: `/projects/${project.id}`,
  });

  return member;
};
