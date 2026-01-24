import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/profile.css";

const DEFAULT_AVATAR = "https://i.pravatar.cc/300?img=12";

export default function Profile() {
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("account");
  const [isEditing, setIsEditing] = useState(false);
  const [showLogout, setShowLogout] = useState(false);

  /* ================= PROFILE DATA ================= */

  const initialProfile = {
    name: "",
    designation: "",
    joiningDate: "",
    department: "",
    address: "",
    email: "",
    mobile: "",
    gradePay: "",
    promotionDesignation: "",
    eligibilityDate: "",
    assessmentPeriod: "",
    role: "", // faculty / hod / principal / admin
  };

  const [profileData, setProfileData] = useState(initialProfile);
  const [editData, setEditData] = useState(initialProfile);

  useEffect(() => {
    const storedProfile = localStorage.getItem("userProfile");
    if (storedProfile) {
      const parsed = JSON.parse(storedProfile);
      setProfileData(parsed);
      setEditData(parsed);
    }
  }, []);

  /* ================= PROFILE IMAGE ================= */

  const [profileImage, setProfileImage] = useState(DEFAULT_AVATAR);

  // 🔹 Image editor states
  const [tempImage, setTempImage] = useState(null);
  const [showImageEditor, setShowImageEditor] = useState(false);
  const [cropArea, setCropArea] = useState({ x: 50, y: 50, size: 200 });
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  // Step 1: Select image → open preview editor
  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setTempImage(reader.result);
      setCropArea({ x: 50, y: 50, size: 200 });
      setShowImageEditor(true);
    };
    reader.readAsDataURL(file);
  };

  // Mouse handlers for dragging crop area
  const handleCropMouseDown = (e) => {
    e.preventDefault();
    setIsDragging(true);
    setDragStart({ x: e.clientX - cropArea.x, y: e.clientY - cropArea.y });
  };

  const handleResizeMouseDown = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsResizing(true);
    setDragStart({ x: e.clientX, y: e.clientY, size: cropArea.size });
  };

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (isDragging) {
        const container = document.querySelector('.image-preview-container');
        if (!container) return;
        
        const rect = container.getBoundingClientRect();
        let newX = e.clientX - dragStart.x;
        let newY = e.clientY - dragStart.y;

        // Constrain within container
        newX = Math.max(0, Math.min(newX, rect.width - cropArea.size));
        newY = Math.max(0, Math.min(newY, rect.height - cropArea.size));

        setCropArea(prev => ({ ...prev, x: newX, y: newY }));
      }

      if (isResizing) {
        const container = document.querySelector('.image-preview-container');
        if (!container) return;
        
        const rect = container.getBoundingClientRect();
        const deltaX = e.clientX - dragStart.x;
        const deltaY = e.clientY - dragStart.y;
        const delta = Math.max(deltaX, deltaY);
        
        let newSize = dragStart.size + delta;
        newSize = Math.max(100, Math.min(newSize, rect.width - cropArea.x, rect.height - cropArea.y));

        setCropArea(prev => ({ ...prev, size: newSize }));
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      setIsResizing(false);
    };

    if (isDragging || isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, isResizing, dragStart, cropArea]);

  // Step 2: Save cropped image
  const saveImage = () => {
    const canvas = document.createElement("canvas");
    canvas.width = 300;
    canvas.height = 300;
    const ctx = canvas.getContext("2d");

    const img = new Image();
    img.src = tempImage;
    img.onload = () => {
      const container = document.querySelector('.image-preview-container');
      const rect = container.getBoundingClientRect();
      
      // Calculate actual image coordinates based on displayed size
      const scaleX = img.width / rect.width;
      const scaleY = img.height / rect.height;

      ctx.drawImage(
        img,
        cropArea.x * scaleX,
        cropArea.y * scaleY,
        cropArea.size * scaleX,
        cropArea.size * scaleY,
        0,
        0,
        300,
        300
      );

      setProfileImage(canvas.toDataURL("image/jpeg"));
      setTempImage(null);
      setShowImageEditor(false);
    };
  };

  const cancelImageEdit = () => {
    setTempImage(null);
    setShowImageEditor(false);
  };

  const deleteImage = () => {
    setProfileImage(DEFAULT_AVATAR);
  };

  /* ================= PROFILE EDIT ================= */

  const startEdit = () => {
    setEditData(profileData);
    setIsEditing(true);
  };

  const cancelEdit = () => {
    setEditData(profileData);
    setIsEditing(false);
  };

  const saveProfile = () => {
    setProfileData(editData);
    localStorage.setItem("userProfile", JSON.stringify(editData));
    setIsEditing(false);
  };

  const handleProfileChange = (e) => {
    setEditData({ ...editData, [e.target.name]: e.target.value });
  };

  /* ================= PASSWORD ================= */

  const [password, setPassword] = useState({
    current: "",
    newPass: "",
    confirm: "",
  });

  const passwordMismatch =
    password.newPass &&
    password.confirm &&
    password.newPass !== password.confirm;

  return (
    <div className="dashboard">
      {/* ================= SIDEBAR ================= */}
      <div className="sidebar">
        <img
          src={profileImage}
          className="avatar"
          alt="Profile"
          style={{ objectFit: "cover" }}
        />

        {isEditing && (
          <div className="photo-actions">
            <label className="photo-btn">
              Change Photo
              <input type="file" accept="image/*" onChange={handleImageSelect} />
            </label>
            <button className="delete-btn" onClick={deleteImage}>
              Delete Photo
            </button>
          </div>
        )}

        {/* Back to dashboard */}
        <button
          className="sidebar-button"
          onClick={() => {
            if (profileData.role === "hod") navigate("/hod/dashboard");
            else if (profileData.role === "principal")
              navigate("/principal/dashboard");
            else if (profileData.role === "admin")
              navigate("/admin/dashboard");
            else navigate("/faculty/dashboard");
          }}
        >
          ← Back to Dashboard
        </button>

        <button
          className={`sidebar-button ${
            activeTab === "account" ? "active" : ""
          }`}
          onClick={() => setActiveTab("account")}
        >
          Account Details
        </button>

        <button
          className={`sidebar-button ${
            activeTab === "password" ? "active" : ""
          }`}
          onClick={() => setActiveTab("password")}
        >
          Change Password
        </button>

        <button className="sidebar-button" onClick={() => setShowLogout(true)}>
          Log Out
        </button>
      </div>

      {/* ================= CONTENT ================= */}
      <div className="content">
        {activeTab === "account" && (
          <>
            <div className="header">
              <h1 className="header-title">Account Details</h1>
              {!isEditing ? (
                <button className="edit-btn" onClick={startEdit}>
                  Edit Profile
                </button>
              ) : (
                <div className="header-actions">
                  <button className="save-btn" onClick={saveProfile}>
                    Save
                  </button>
                  <button className="cancel-header-btn" onClick={cancelEdit}>
                    Cancel
                  </button>
                </div>
              )}
            </div>

            <div className="form">
              {Object.entries(editData).map(([k, v]) => (
                <div key={k} className="form-field">
                  <label className="label">
                    {k.replace(/([A-Z])/g, " $1")}
                  </label>

                  {k === "designation" && isEditing ? (
                    <select
                      name={k}
                      value={v}
                      onChange={handleProfileChange}
                      className="select"
                    >
                      <option>Teaching Staff</option>
                      <option>HOD</option>
                      <option>Principal</option>
                      <option>Admin</option>
                    </select>
                  ) : (
                    <input
                      name={k}
                      value={v}
                      onChange={handleProfileChange}
                      disabled={!isEditing}
                      className={`input ${!isEditing ? "disabled" : ""}`}
                    />
                  )}
                </div>
              ))}
            </div>
          </>
        )}

        {activeTab === "password" && (
          <div className="password-box">
            <h1 className="password-title">Change Password</h1>

            <input
              type="password"
              placeholder="Current Password"
              className="password-input"
              value={password.current}
              onChange={(e) =>
                setPassword({ ...password, current: e.target.value })
              }
            />

            <input
              type="password"
              placeholder="New Password"
              className="password-input"
              value={password.newPass}
              onChange={(e) =>
                setPassword({ ...password, newPass: e.target.value })
              }
            />

            <input
              type="password"
              placeholder="Confirm Password"
              className="password-input"
              value={password.confirm}
              onChange={(e) =>
                setPassword({ ...password, confirm: e.target.value })
              }
            />

            {passwordMismatch && (
              <p className="error">Password does not match</p>
            )}

            <button className="update-btn">Update Password</button>
          </div>
        )}
      </div>

      {/* ================= IMAGE EDITOR MODAL ================= */}
      {showImageEditor && (
        <div className="modal">
          <div className="crop-box">
            <h2 className="crop-title">Edit Photo</h2>

            <div className="image-preview-container">
              <img
                src={tempImage}
                alt="Preview"
                className="preview-image"
                draggable="false"
              />

              {/* Crop overlay */}
              <div
                className="crop-overlay"
                style={{
                  left: cropArea.x,
                  top: cropArea.y,
                  width: cropArea.size,
                  height: cropArea.size,
                  cursor: isDragging ? 'grabbing' : 'grab'
                }}
                onMouseDown={handleCropMouseDown}
              >
                <div className="crop-border"></div>

                {/* Resize handle */}
                <div
                  className="resize-handle"
                  onMouseDown={handleResizeMouseDown}
                ></div>
              </div>
            </div>

            <div className="editor-hint">
              Drag to move • Drag corner to resize
            </div>

            <div className="modal-actions">
              <button className="crop-save-btn" onClick={saveImage}>
                Save Photo
              </button>
              <button className="modal-cancel-btn" onClick={cancelImageEdit}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= LOGOUT MODAL ================= */}
      {showLogout && (
        <div className="modal">
          <div className="logout-box">
            <h2>Log out?</h2>
            <p>Are you sure you want to log out?</p>

            <div className="modal-actions">
              <button
                className="logout-yes-btn"
                onClick={() => {
                  localStorage.removeItem("loggedInUser");
                  localStorage.removeItem("userProfile");
                  navigate("/login");
                }}
              >
                Log Out
              </button>

              <button
                className="modal-cancel-btn"
                onClick={() => setShowLogout(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}