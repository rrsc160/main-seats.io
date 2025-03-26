
import React, { useMemo, useRef } from "react";

const SelectedSeats = ({ selectedSeats, onBookSeats }) => {
  const listRef = useRef(null);

  // const memoizedSeats = useMemo(() => {
  //   return selectedSeats.map((seat) => (
  //     <li key={seat.id} className="seat-item">
  //       <div className="seat-info">
  //         <span className="seat-id">{seat.label}</span>
  //         <span className="seat-category">(ID: {seat.id})</span>
  //       </div>
  //     </li>
  //   ));
  // }, [selectedSeats]);

  const memoizedSeats = useMemo(() => {
    return selectedSeats.map((seat) => (
      <li key={seat.id} className="seat-item">
        <div className="seat-info">
          <span className="seat-id">LABEL:{seat.label}</span>
          <span className="seat-category">ID: {seat.id}</span>
          <span className="seat-price"> PRICE: ${seat.price}</span> 
        </div>
      </li>
    ));
  }, [selectedSeats]);
  
  return (
    <div className="selected-seats">
      <button className="book-seats-btn" onClick={onBookSeats}>
        BOOK SELECTED SEATS
      </button>
      <h3>SELECTED SEATS</h3>
      <ul ref={listRef}>{memoizedSeats.length > 0 ? memoizedSeats : <li className="no-seats">No seats selected yet.</li>}</ul>
    </div>
  );
};

export default SelectedSeats;
