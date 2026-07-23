import { useEffect, useState } from "react";

export default function useDateRange() {
  const [dateRange, setDateRange] = useState(
    () => localStorage.getItem("kavach-date-range") || "12"
  );

  useEffect(() => {
    const handleDateChange = (event) => {
      setDateRange(event.detail);
    };

    window.addEventListener(
      "kavach-date-range-change",
      handleDateChange
    );

    return () => {
      window.removeEventListener(
        "kavach-date-range-change",
        handleDateChange
      );
    };
  }, []);

  return dateRange;
}