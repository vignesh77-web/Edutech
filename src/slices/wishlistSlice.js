import { createSlice } from "@reduxjs/toolkit"

const initialState = {
  wishlist: [],
  totalItems: 0,
}

const wishlistSlice = createSlice({
  name: "wishlist",
  initialState,
  reducers: {
    setWishlist: (state, action) => {
      state.wishlist = action.payload
      state.totalItems = action.payload.length
    },
    resetWishlist: (state) => {
      state.wishlist = []
      state.totalItems = 0
    },
  },
})

export const { setWishlist, resetWishlist } = wishlistSlice.actions

export default wishlistSlice.reducer
