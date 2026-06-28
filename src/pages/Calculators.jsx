import { Link } from "react-router-dom";
import "./pageStyles.css";


export default function Calculators() {
  

  const calculators = [
    {
      id: "pvalue",
      name: "P-Value Calculator",
      path: "p-value"
    },
    {
      id: "distribution",
      name: "Distribution Calculator",
      path: "distributions"
    }
  ];



  return (
    <div className="calculators-page">
      

      <div className="calculator-grid">
        {calculators.map((calc) => (
          <Link
            key={calc.id}
            to={calc.path}
            className="calculator-select-button"
          >
            {calc.name}
          </Link>
        ))}
      </div>
    </div>
  );
}