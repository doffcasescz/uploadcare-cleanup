// Get current date and time to create a unique log file name
const now = new Date();
const timestamp = now.toISOString().replace(/[:.]/g, "-");
const year = now.getFullYear();
const month = String(now.getMonth() + 1).padStart(2, "0");
const day = String(now.getDate()).padStart(2, "0");

const formatedDate = `${year}-${month}-${day}`;

export const date = {
  now,
  timestamp,
  year,
  month,
  day,
  formatedDate,
}
