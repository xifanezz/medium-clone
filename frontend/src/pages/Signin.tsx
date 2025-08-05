import { Heading } from "../component/Heading";
import { Warning } from "../component/Warning";
import { Inputbox } from "../component/Inputbox";
import { Button } from "../component/Button";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Quotes } from "../component/Quotes";
import {Error as ErrorIcon , Google} from "../Icons";
import { supabase } from "../lib/supabaseClient";

export const googleSignIn = async () => {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: "google",
  });
  if (error) throw new Error(error.message);
};

export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) console.error("Sign out error:", error.message);
};

export const Signin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSignIn = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError("");
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;

      if (data.user) {
        navigate("/blogs");
      }
    } catch (err: any) {
      setError(err.message || "Unable to login. Please try again.");
    }
  };

  const handleInputChange = (setter: (value: string) => void) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setError("");
    setter(e.target.value);
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-blue-100 to-white">
      <div className="w-full lg:w-1/2 p-4 lg:p-8 flex justify-center items-center bg-blend-luminosity">
        <div className="rounded-md shadow-xl w-full max-w-md bg-white p-6 lg:p-8">
          <form onSubmit={handleSignIn}>
            <Heading label={"Login"} />
            <Warning
              label={"Don't have an account?"}
              buttonText={"Sign up"}
              to={"/signup"}
            />

            <Inputbox
              label={"Email"}
              placeholder={"Enter your email"}
              onChange={handleInputChange(setEmail)}
              type={"email"}

            />
            <Inputbox
              label={"Password"}
              placeholder={"Enter your password"}
              onChange={handleInputChange(setPassword)}
              type={"password"}

            />

            {error && (
              <div
                className="flex items-center p-4 mb-4 text-sm text-red-800 border border-red-300 rounded-lg bg-red-50 dark:bg-gray-800 dark:text-red-400 dark:border-red-800"
                role="alert"
              >
                <ErrorIcon />
                <span className="sr-only">Error</span>
                <div>
                  <span className="font-medium">Error alert!</span> {error}
                </div>
              </div>
            )}

            <Button
              label={"Login"}
              onClick={handleSignIn}
              type="submit"
              className="mt-4"
            />
            <Button
              label={"Google"}
              onClick={googleSignIn}
              icon={<Google size={22} color="white" />}
              className="mt-2 text-black  bg-green-400 border border-gray-300 hover:bg-gray-100"
            />
          </form>
        </div>
      </div>

      <div className="hidden lg:flex lg:w-1/2 bg-slate-50 justify-center items-center p-8">
        <Quotes />
      </div>
    </div>
  );
};

