// user.controller.ts
import { StatusCodes } from 'http-status-codes';
import { userServices } from './user.service';
import { Request, Response } from 'express';
import { catchAsync } from '../../utills/catchAsync';
import sendResponse from '../../utills/sendResponse';

const getAllUsers = catchAsync(async (req:Request, res:Response) => {
  const result = await userServices.getAllUsers();
  sendResponse(res, {
    message: 'User fetched successfully',
    statusCode: StatusCodes.OK,
    data: result,
  });
});

const getAllTutors = catchAsync(async (req:Request, res:Response) => {
  const result = await userServices.getAllTutors();
  sendResponse(res, {
    message: 'Tutors fetched successfully',
    statusCode: StatusCodes.OK,
    data: result,
  });
});
const getTutorById = catchAsync(async (req:Request, res:Response) => {
  const { id } = req.params;
  const result = await userServices.getTutorById(id);
  sendResponse(res, {
    message: 'Tutor fetched successfully',
    statusCode: StatusCodes.OK,
    data: result,
  });
});
const getSingleUser = catchAsync(async (req:Request, res:Response) => {
  const { id } = req.params;
  const result = await userServices.getUser(id);
  sendResponse(res, {
    message: 'User fetched successfully',
    statusCode: StatusCodes.OK,
    data: result,
  });
});
const updateUser = catchAsync(async (req:Request, res:Response) => {
  const { email } = req.params;
  const result = await userServices.updateUser(email, req.body);

  sendResponse(res, {
    message: 'User is updated successfully',
    statusCode: StatusCodes.OK,
    data: result,
  });
});

export const userControllers = {
  getAllUsers,
  updateUser,
  getAllTutors,
  getTutorById,
  getSingleUser,
};
