import React, { useEffect } from "react";
import {BrowserRouter, Navigate, Route, Routes} from "react-router-dom";
import IntroPage from "./IntroPage";
import PurchaseTicket from "./PurchaseTicket";
import CreateEvent from "./CreateEvent";
import ListForSale from "./ListForSale";
import GetEventDetails from "./GetEventDetails";
import BuyTicket from "./BuyTicket";
import MyTickets from "./MyTickets";
import ActiveListings from "./ActiveListings";

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<IntroPage/>}></Route>
        <Route path="/purchaseticket" element={<PurchaseTicket/>}></Route>
        <Route path="/createevent" element={<CreateEvent/>}></Route>
        <Route path="/listforsale" element={<ListForSale/>}></Route>
        <Route path="/geteventdetails" element={<GetEventDetails/>}></Route>
        <Route path="/buyfromuser" element={<BuyTicket/>}></Route>
        <Route path="/mytickets" element={<MyTickets/>}></Route>
        <Route path="/activeListings" element={<ActiveListings/>}></Route>
      </Routes>
    </BrowserRouter>
  )


}

export default App;