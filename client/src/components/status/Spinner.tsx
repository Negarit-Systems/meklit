import { AiOutlineLoading3Quarters } from "react-icons/ai";

const Spinner = ({ spin, property}: { spin: boolean, property:string }) => {
  if (!spin) return null;
  return <AiOutlineLoading3Quarters className={`animate-spin ${property} `}/>;
};

export default Spinner;
