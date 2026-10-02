import axios from "axios";

export default axios.create({
  baseURL: "http://51.20.120.77:30001/api/v1/restaurants",
  headers: {
    "Content-type": "application/json"
  }
});
