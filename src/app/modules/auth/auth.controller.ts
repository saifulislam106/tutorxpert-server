import { StatusCodes } from 'http-status-codes';
import { AuthServices } from './auth.service';
import { catchAsync } from '../../utills/catchAsync';
import sendResponse from '../../utills/sendResponse';
import config from '../../config';



const createUser = catchAsync(async (req, res) => {
  const result = await AuthServices.createUser(req.body);

  sendResponse(res, {
    message: 'User registered successfully',
    statusCode: StatusCodes.CREATED,
    data: result,
  });
});

const loginUser = catchAsync(async (req, res) => {
  const result = await AuthServices.loginUser(req.body);
  const { accessToken } = result;

  res.cookie('accessToken', accessToken, {
    secure: config.NODE_ENV === 'production',
    httpOnly: true,
  });

  sendResponse(res, {
    message: 'Login successful',
    statusCode: StatusCodes.OK,
    data: { accessToken: accessToken },
  });
});

export const AuthControllers = {
  createUser,
  loginUser,
};
