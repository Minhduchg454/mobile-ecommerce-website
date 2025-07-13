import { createAsyncThunk } from "@reduxjs/toolkit"; //giup tao cac hanh dong bat dong bo, thuong goi la api
import * as apis from "../../apis";

export const getCurrent = createAsyncThunk(
  "user/current",
  async (data, { rejectWithValue }) => {
    const response = await apis.apiGetCurrent();
    if (!response.success) return rejectWithValue(response); //baoo loi tu redux
    return response.user;
  }
);

/*
1. Tên action: 'user/current'
	•	Đây là tên action type sẽ được tạo:
	•	user/current/pending
	•	user/current/fulfilled
	•	user/current/rejecte

*/
