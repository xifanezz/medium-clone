import { useState, useEffect } from 'react';
import axios from 'axios';
import * as Spinners from "react-loader-spinner";

interface Quote {
  content: string;
  author: string;
}

export function Quotes(): JSX.Element {
  const [quote, setQuote] = useState<Quote | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);


  useEffect(() => {
    getQuote();
  }, []);

  const getQuote = async () => {
    setIsLoading(true);

    try {
      const response = await axios.get<Quote>("https://api.quotable.io/random");
      setQuote(response.data);
    } catch (err) {
        console.error(err);

    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col justify-center p-10">
      {isLoading && (
        <Spinners.Oval
          visible={true}
          height={50}
          width={50}
          color="#000000"
          secondaryColor = "#000000"
            strokeWidth={4}
            strokeWidthSecondary={5}
          ariaLabel="oval-loading"

          wrapperStyle={{}}
          wrapperClass=""
        />
      )}

      <>
        <p className="text-3xl font-semibold mb-4">{quote?.content}</p>
        <p className="text-md italic items-start ">{quote?.author}</p>
      </>

    </div>
  );
}