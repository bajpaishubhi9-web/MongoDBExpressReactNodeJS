import axios from "axios";

export default axios.create({
  baseURL: "http://16.16.220.112:5001/api/v1/restaurants",
  headers: {
    "Content-type": "application/json"
  }
});
