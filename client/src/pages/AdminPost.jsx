import React, { useEffect, useState } from "react";
import InputComp from "../Components/InputComp";
import deleteIcon from "../assets/images/deleteicon.svg";
import { useNavigate } from "react-router";

const AdminPost = () => {
  const navigate = useNavigate();
  const [post, setPost] = useState("");
  const [message, setMessage] = useState("");
  const [vancancies, setVacancies] = useState([]);
  async function fetchData() {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_SERVER_BASE_URL}/user/vacancy`
      );
      const data = await response.json();
      if (data.error) return;
      setVacancies(data.data);
      console.log(vancancies);
    } catch (err) {
      console.log(err);
    }
  }
  useEffect(() => {
    (async() => {
      await fetchData();
    })();
  }, []);
  async function handleSubmit(e) {
    e.preventDefault();
    try {
      const response = await fetch(
        `${import.meta.env.VITE_SERVER_BASE_URL}/admin/vacancy`,
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ post }),
        }
      );
      if (response.status === 403) {
        console.log("Unauthorized access");
        navigate("/adminLogin");
      }
      setTimeout(() => {
        setMessage("");
      }, 5000);
      const data = await response.json();
      if (response.status === 200) {
        setMessage(data.message || "Post Added");
        await fetchData();
      } else {
        setMessage(data.error || "Something went wrong");
      }
    } catch (err) {
      console.log(err);
    }
  }

  async function handleDelete(vacancyId) {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_SERVER_BASE_URL}/admin/vacancy`,
        {
          method: "DELETE",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ vacancyId }),
        }
      );
      if (response.status === 403) {
        console.log("Unauthorized access");
        navigate("/adminLogin");
      }
      const data = await response.json();
      if (response.status === 200)
        setMessage(data.message || "Vacancy Deleted Successfully");
      await fetchData();
    } catch (err) {
      console.log(err);
    }
  }

  return (
    <>
      <section className="w-4/5 mx-auto ">
        <h1 className="text-center text-4xl font-bold my-6">
          Add or Remove Post
        </h1>
        <form
          className="my-10"
          onSubmit={(e) => {
            handleSubmit(e);
          }}
        >
          <InputComp value={post} setValue={setPost} type={"text"}>
            Enter Post
          </InputComp>
          <button className="bg-blue-500 text-white px-4 py-2 my-5 rounded-md">
            Add
          </button>
        </form>
        {message && <p className="relative">{message}</p>}
        <div className=" relative top-10">
          <h1 className="text-2xl my-3">Vacancies</h1>
          {!!vancancies.length &&
            vancancies.map((vacancy) => {
              return (
                <>
                  <div
                    className="flex justify-between text-lg"
                    key={vacancy.id}
                  >
                    <p>{vacancy.name}</p>
                    <button
                      onClick={(e) => {
                        handleDelete(vacancy.id);
                        className = "cursor-pointer";
                      }}
                    >
                      <img
                        src={deleteIcon}
                        className="h-10 w-10 cursor-pointer"
                        alt=""
                      />
                    </button>
                  </div>
                </>
              );
            })}
        </div>
      </section>
    </>
  );
};

export default AdminPost;
