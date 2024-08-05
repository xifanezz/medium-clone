import { useState, useEffect } from 'react';
import axios from 'axios';
import * as Spinners from "react-loader-spinner";



interface Quote {
  quote: string;
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
      const response = await axios.get<Quote[]>("https://api.api-ninjas.com/v1/quotes",{
        headers: { 'X-Api-Key': process.env.NEXT_PUBLIC_X_API_KEY}
      });
      
      
      const firstQuote = response.data[0];
      setQuote(firstQuote);

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
        <p className="text-3xl font-semibold mb-4">{quote?.quote}</p>
        <p className="text-md italic items-start ">{quote?.author}</p>
      </>

    </div>
  );
}