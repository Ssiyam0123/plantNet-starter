import { Helmet } from "react-helmet-async";
import Plants from "../../components/Home/Plants";
import axios from "axios";
import { useEffect, useState } from "react";

const Home = () => {
  const [plants, setPlants] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const { data } = await axios.get(
        `${import.meta.env.VITE_API_URL}/plants`
      );
      setPlants(data);
      // console.log(data)
      // console.log(plants);
    };
    fetchData();
  }, []);

  return (
    <div>
      <Helmet>
        <title> PlantNet | Buy Your Desired Plant</title>
      </Helmet>
      <Plants plants={plants} />
    </div>
  );
};

export default Home;
