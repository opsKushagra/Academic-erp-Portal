import React, { useState, useEffect } from "react";
import axios from "axios";

function App() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: ""
  });

  const [msg, setMsg] = useState("");
  const [user, setUser] = useState(null);
  const [myCourses, setMyCourses] = useState([]);
  const [activeTab, setActiveTab] = useState("student");
  const [isRegister, setIsRegister] = useState(false);

  const courses = [
    { code: "CSE101", name: "Software Engineering", credits: 4 },
    { code: "CSE102", name: "DBMS", credits: 4 },
    { code: "CSE103", name: "Operating Systems", credits: 4 },
    { code: "CSE104", name: "Computer Networks", credits: 4 },
    { code: "CSE105", name: "Web Development", credits: 3 },
    { code: "CSE106", name: "Data Structures", credits: 4 },
    { code: "CSE107", name: "Java Programming", credits: 3 },
    { code: "CSE108", name: "Python Programming", credits: 3 },
    { code: "CSE109", name: "Artificial Intelligence", credits: 4 },
    { code: "CSE110", name: "Machine Learning", credits: 4 }
  ];

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  const handleLogin = async () => {
    try {
      const res = await axios.post(
        "http://localhost:5000/api/auth/login",
        {
          email: form.email,
          password: form.password
        }
      );

      setUser(res.data.user);
      setMsg("");

    } catch (error) {
      setMsg("Login Failed");
    }
  };

  const handleRegister = async () => {
    try {
      const res = await axios.post(
        "http://localhost:5000/api/auth/register",
        {
          name: form.name,
          email: form.email,
          password: form.password,
          role: activeTab
        }
      );

      setMsg(res.data.msg || "Registered");
      setIsRegister(false);

    } catch (error) {
      setMsg("Register Failed");
    }
  };

  const logout = () => {
    setUser(null);
    setMyCourses([]);
  };

  const fetchCourses = async () => {
    try {
      const res = await axios.get(
        `http://localhost:5000/api/enroll/${user.email}`
      );

      setMyCourses(res.data);

    } catch (error) {
      console.log(error);
    }
  };

  const enrollCourse = async (course) => {
    try {
      await axios.post(
        "http://localhost:5000/api/enroll/add",
        {
          studentEmail: user.email,
          courseName: course.name
        }
      );

      fetchCourses();

    } catch (error) {
      console.log(error);
    }
  };

  const dropCourse = async (courseName) => {
    try {
      await axios.delete(
        "http://localhost:5000/api/enroll/drop",
        {
          data: {
            studentEmail: user.email,
            courseName: courseName
          }
        }
      );

      fetchCourses();

    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    if (user && user.role === "student") {
      fetchCourses();
    }
  }, [user]);

  // LOGIN PAGE
  if (!user) {
    return (
      <div style={loginPage}>
        <div style={loginBox}>
          <h1>Academic ERP Portal</h1>

          <div style={tabWrap}>
            {["student", "faculty", "admin"].map((role) => (
              <button
                key={role}
                onClick={() => setActiveTab(role)}
                style={{
                  ...tabBtn,
                  background:
                    activeTab === role ? "#2563eb" : "#e2e8f0",
                  color:
                    activeTab === role ? "white" : "black"
                }}
              >
                {role.toUpperCase()}
              </button>
            ))}
          </div>

          <h3>
            {isRegister ? "Register" : "Login"} as {activeTab}
          </h3>

          {isRegister && (
            <input
              name="name"
              placeholder="Enter Name"
              onChange={handleChange}
              style={inputStyle}
            />
          )}

          <input
            name="email"
            placeholder="Enter Email"
            onChange={handleChange}
            style={inputStyle}
          />

          <input
            type="password"
            name="password"
            placeholder="Enter Password"
            onChange={handleChange}
            style={inputStyle}
          />

          <button
            onClick={
              isRegister ? handleRegister : handleLogin
            }
            style={blueBtn}
          >
            {isRegister ? "Register" : "Login"}
          </button>

          <p style={{ color: "red" }}>{msg}</p>

          <p
            style={switchText}
            onClick={() =>
              setIsRegister(!isRegister)
            }
          >
            {isRegister
              ? "Already have account? Login"
              : "New user? Register"}
          </p>
        </div>
      </div>
    );
  }

  // ADMIN
  if (user.role === "admin") {
    return (
      <DashboardLayout user={user} logout={logout}>
        <Card title="Total Users" text="150" />
        <Card title="Faculty" text="12 Active" />
        <Card title="Courses" text="10 Subjects" />
      </DashboardLayout>
    );
  }

  // FACULTY
  if (user.role === "faculty") {
    return (
      <DashboardLayout user={user} logout={logout}>
        <Card title="Assigned Subjects" text="DBMS, OS" />
        <Card title="Students" text="120 Students" />
        <Card title="Upload Marks" text="Enabled" />
      </DashboardLayout>
    );
  }

  // STUDENT
  return (
    <DashboardLayout user={user} logout={logout}>

      <div style={tableCard}>
        <h2>Enroll Subjects</h2>

        <table style={tableStyle}>
          <thead>
            <tr>
              <th>Code</th>
              <th>Subject</th>
              <th>Credits</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>
            {courses.map((course, i) => {
              const enrolled = myCourses.some(
                (item) =>
                  item.courseName === course.name
              );

              return (
                <tr key={i}>
                  <td>{course.code}</td>
                  <td>{course.name}</td>
                  <td>{course.credits}</td>

                  <td>
                    <button
                      disabled={enrolled}
                      onClick={() =>
                        enrollCourse(course)
                      }
                      style={{
                        ...blueBtn,
                        background:
                          enrolled
                            ? "gray"
                            : "#2563eb"
                      }}
                    >
                      {enrolled
                        ? "Enrolled"
                        : "Enroll"}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div style={card}>
        <h2>My Courses</h2>

        {myCourses.length === 0 ? (
          <p>No Courses</p>
        ) : (
          myCourses.map((item, i) => (
            <div key={i}>
              <p>{item.courseName}</p>

              <button
                onClick={() =>
                  dropCourse(item.courseName)
                }
                style={redBtn}
              >
                Drop
              </button>

              <hr />
            </div>
          ))
        )}
      </div>

      <ResultCard />

    </DashboardLayout>
  );
}

// RESULT CARD
function ResultCard() {
  const [selectedSem, setSelectedSem] =
    useState(null);

  const resultDetails = {
    1: [
      {
        subject: "Engineering Mathematics-I",
        grade: "A"
      },
      {
        subject: "Physics",
        grade: "B+"
      },
      {
        subject:
          "Programming for Problem Solving",
        grade: "A"
      },
      {
        subject:
          "Basic Electrical Engineering",
        grade: "B"
      },
      {
        subject:
          "Communication Skills",
        grade: "A+"
      }
    ],

    2: [
      {
        subject: "Engineering Mathematics-II",
        grade: "A"
      },
      {
        subject: "Chemistry",
        grade: "B+"
      },
      {
        subject: "Data Structures",
        grade: "A+"
      },
      {
        subject:
          "Engineering Graphics",
        grade: "B+"
      },
      {
        subject:
          "Environmental Studies",
        grade: "A"
      }
    ],

    3: [
      {
        subject:
          "Discrete Mathematics",
        grade: "A"
      },
      {
        subject:
          "OOP using Java",
        grade: "A+"
      },
      {
        subject:
          "Digital Logic Design",
        grade: "B+"
      },
      {
        subject:
          "Computer Organization",
        grade: "A"
      },
      {
        subject: "DBMS",
        grade: "A+"
      }
    ]
  };

  return (
    <div style={card}>
      <h2>Results</h2>

      <table style={tableStyle}>
        <thead>
          <tr>
            <th>Semester</th>
            <th>SGPA</th>
            <th>Status</th>
          </tr>
        </thead>

        <tbody>
          <tr
            style={clickRow}
            onClick={() =>
              setSelectedSem(1)
            }
          >
            <td>Semester 1</td>
            <td>8.5</td>
            <td>Pass</td>
          </tr>

          <tr
            style={clickRow}
            onClick={() =>
              setSelectedSem(2)
            }
          >
            <td>Semester 2</td>
            <td>8.7</td>
            <td>Pass</td>
          </tr>

          <tr
            style={clickRow}
            onClick={() =>
              setSelectedSem(3)
            }
          >
            <td>Semester 3</td>
            <td>9.0</td>
            <td>Pass</td>
          </tr>
        </tbody>
      </table>

      <h3 style={{ marginTop: "15px" }}>
        CGPA: 8.8 / 10
      </h3>

      {selectedSem && (
        <div style={{ marginTop: "20px" }}>
          <h3>
            Semester {selectedSem} Detailed
            Result
          </h3>

          <table style={tableStyle}>
            <thead>
              <tr>
                <th>Subject</th>
                <th>Grade</th>
              </tr>
            </thead>

            <tbody>
              {resultDetails[
                selectedSem
              ].map((item, i) => (
                <tr key={i}>
                  <td>{item.subject}</td>
                  <td>{item.grade}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// LAYOUT
function DashboardLayout({
  user,
  logout,
  children
}) {
  return (
    <div style={mainPage}>
      <div style={header}>
        <div>
          <h1>Welcome {user.name}</h1>
          <p>
            {user.role.toUpperCase()} DASHBOARD
          </p>
        </div>

        <button
          onClick={logout}
          style={redBtn}
        >
          Logout
        </button>
      </div>

      <div style={grid}>{children}</div>
    </div>
  );
}

// CARD
function Card({ title, text }) {
  return (
    <div style={card}>
      <h2>{title}</h2>
      <p>{text}</p>
    </div>
  );
}

// STYLES
const loginPage = {
  minHeight: "100vh",
  background:
    "linear-gradient(to right,#0f172a,#1e3a8a)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center"
};

const loginBox = {
  background: "white",
  padding: "35px",
  width: "420px",
  borderRadius: "12px",
  textAlign: "center"
};

const tabWrap = {
  display: "flex",
  gap: "8px",
  marginBottom: "18px"
};

const tabBtn = {
  flex: 1,
  padding: "10px",
  border: "none",
  borderRadius: "8px",
  cursor: "pointer",
  fontWeight: "bold"
};

const switchText = {
  marginTop: "12px",
  color: "#2563eb",
  cursor: "pointer",
  fontWeight: "bold"
};

const mainPage = {
  minHeight: "100vh",
  background: "#f1f5f9",
  padding: "25px"
};

const header = {
  background: "#1e293b",
  color: "white",
  padding: "20px",
  borderRadius: "12px",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center"
};

const grid = {
  display: "grid",
  gridTemplateColumns:
    "repeat(auto-fit,minmax(320px,1fr))",
  gap: "20px",
  marginTop: "20px"
};

const card = {
  background: "white",
  padding: "20px",
  borderRadius: "12px"
};

const tableCard = {
  ...card,
  gridColumn: "span 2"
};

const tableStyle = {
  width: "100%",
  borderCollapse: "collapse"
};

const clickRow = {
  cursor: "pointer"
};

const inputStyle = {
  width: "100%",
  padding: "12px",
  marginBottom: "12px"
};

const blueBtn = {
  padding: "8px 14px",
  background: "#2563eb",
  color: "white",
  border: "none",
  borderRadius: "6px",
  cursor: "pointer"
};

const redBtn = {
  padding: "8px 14px",
  background: "#ef4444",
  color: "white",
  border: "none",
  borderRadius: "6px",
  cursor: "pointer"
};

export default App;