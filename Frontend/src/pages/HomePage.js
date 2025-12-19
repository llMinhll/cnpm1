import React from "react";
import { useNavigate } from "react-router-dom";

function HomePage() {
  const nav = useNavigate();

  return (
    <div className="page-container">

      <div className="card" style={{ 
        background: "linear-gradient(135deg, #0d6efd, #4ba3ff)", 
        color: "white"
      }}>
        <h1 style={{ margin: 0, fontSize: 28 }}>Chào Bạn! 👋</h1>
        <p>Chúc bạn một ngày tốt lành</p>
      </div>
      <div className="card">
        <h2>SmartBus </h2>
        <p> Phần mềm định vị và quản lí xe bus </p>

        <button className="btn" onClick={() => nav("/map")}>
          Xem bản đồ
        </button>

      
      </div>

    </div>
  );
}

export default HomePage;
