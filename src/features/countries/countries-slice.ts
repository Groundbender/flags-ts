import {
  createAsyncThunk,
  createSlice,
  isRejectedWithValue,
} from "@reduxjs/toolkit";
import { Country, Extra, Status } from "types";

export const loadCountries = createAsyncThunk<
  { data: Country[] },
  void,
  { extra: Extra; state: { countries: CountrySlice }; rejectValue: string }
>(
  "@@countries/load-countries",
  (_, { extra: { client, api }, rejectWithValue }) => {
    try {
      return client.get(api.ALL_COUNTRIES);
    } catch (err) {
      if (err instanceof Error) {
        return rejectWithValue(err.message);
      }

      return rejectWithValue("Unknown error");
    }
  },
  {
    condition: (_, { getState }) => {
      const {
        countries: { status },
      } = getState();

      if (status === "loading") {
        return false;
      }
    },
  }
);

type CountrySlice = {
  status: Status;
  error: string | null;
  list: Country[];
};

const initialState: CountrySlice = {
  status: "idle",
  error: null,
  list: [],
};

const countrySlice = createSlice({
  name: "@@countries",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(loadCountries.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(loadCountries.rejected, (state, action) => {
        state.status = "rejected";
        state.error = action.payload || "Cannot load data";
      })
      .addCase(loadCountries.fulfilled, (state, action) => {
        state.status = "received";
        state.list = action.payload.data;
      });
  },
});

export const countryReducer = countrySlice.reducer;
