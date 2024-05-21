import React, { useEffect, useRef, useState } from 'react';
import './GeneralSettings.css';
import userimg from '../images/user.png';
import { useAuth } from '../../AuthProvider.jsx';
import axios from 'axios';
import {sha512} from "js-sha512";

const GeneralSettings = () => {
    const { user } = useAuth();
    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        email: '',
        phone_number: '',
        image: '',
    });
    const [passwordData, setPasswordData] = useState({
        password: '',
        new_password: '',
        new_password_confirmation: '',
    });
    const [inEditPassword, setInEditPassword] = useState(false);

    useEffect(() => {
        if (user) {
            setFormData({
                first_name: user.first_name || '',
                last_name: user.last_name || '',
                email: user.email || '',
                phone_number: user.phone_number || '',
                image: user.image || '',
            });
        }
    }, [user]);

    const handleChange = (e) => {
        if (e.target.name === 'image') {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onloadend = () => {
                    setFormData({
                        ...formData,
                        image: reader.result,
                    });
                };
                reader.readAsDataURL(file);
            }
        } else {
            setFormData({
                ...formData,
                [e.target.name]: e.target.value,
            });
        }
    };

    const handlePasswordChange = (e) => {
        setPasswordData({
            ...passwordData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const token = window.localStorage.getItem('token');
            if (!token) {
                throw new Error('No token found');
            }
            const response = await axios.put('http://127.0.0.1:8000/api/updateUser', formData, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            if (response.status === 200) {
                console.log('User data updated successfully');
            } else {
                throw new Error('Failed to update user data');
            }
        } catch (error) {
            console.error('Failed to update user data', error);
        }
    };

    const handlePasswordSubmit = async (e) => {
        e.preventDefault();
        try {
            const token = window.localStorage.getItem('token');
            if (!token) {
                throw new Error('No token found');
            }

            // Check if new password and confirmation match
            if (passwordData.new_password !== passwordData.new_password_confirmation) {
                throw new Error('New password and confirmation do not match');
            }

            const response = await axios.put('http://127.0.0.1:8000/api/updatePassword', {
                password: sha512(passwordData.password), // Send the current password in plain text
                new_password: sha512(passwordData.new_password),
                new_password_confirmation: sha512(passwordData.new_password_confirmation),
            }, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            if (response.status === 200) {
                console.log('Password updated successfully');
                setPasswordData({
                    password: '',
                    new_password: '',
                    new_password_confirmation: '',
                });
                setInEditPassword(false);
            } else {
                throw new Error('Failed to update password');
            }
        } catch (error) {
            console.error('Failed to update password', error);
            if (error.response && error.response.data && error.response.data.message) {
                // Display error message to the user
                alert(error.response.data.message);
            } else if (error.message === 'New password and confirmation do not match') {
                alert('New password and confirmation do not match. Please try again.');
            } else {
                // Generic error message
                alert('Failed to update password. Please try again.');
            }
        }
    };

    const fileInputRef = useRef(null);

    const handleClick = () => {
        fileInputRef.current.click();
    };

    const handleEdit = () => {
        setInEditPassword(!inEditPassword);
    };

    return (
        <div className='setting-page-profile'>
            <section className='profile-details-section'>
                <h2>Profile Details</h2>
                <div className='photo-section'>
                    <div className='image'>
                        <img onClick={handleClick} src={formData.image || userimg} alt="user" />
                    </div>
                    <input ref={fileInputRef} type="file" id="image" name="image" accept="image/*" onChange={handleChange} style={{ display: 'none' }} />
                </div>
                <div className='user-email'>
                    <form onSubmit={handleSubmit}>
                        <div className="name_full">
                            <div>
                                <label htmlFor="first_name">First Name</label>
                                <input
                                    type="text"
                                    id='first_name'
                                    name='first_name'
                                    value={formData.first_name}
                                    onChange={handleChange}
                                />
                            </div>
                            <div>
                                <label htmlFor="last_name">Last Name</label>
                                <input
                                    type="text"
                                    id='last_name'
                                    name='last_name'
                                    value={formData.last_name}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>
                        <label htmlFor="email">Email</label>
                        <input
                            type="email"
                            id='email'
                            name='email'
                            value={formData.email}
                            onChange={handleChange}
                        />
                        <label htmlFor="phone">Phone</label>
                        <input
                            type="text"
                            id='phone'
                            name='phone_number'
                            value={formData.phone_number}
                            onChange={handleChange}
                        />
                        <button type="submit">Update</button>
                    </form>
                </div>
            </section>
            <section className='section-second-box'>
                <section className='password-section'>
                    {inEditPassword ? (
                        <div className="edit-password">
                            <h4 className="title-password">Change your password</h4>
                            <form onSubmit={handlePasswordSubmit}>
                                <div className="password-inputs">
                                    <input
                                        type="text"
                                        placeholder="Enter your current password"
                                        name="password"
                                        value={passwordData.password}
                                        onChange={handlePasswordChange}
                                    />
                                    <div className="new-password-dev">
                                        <input
                                            type="text"
                                            placeholder="Enter your new password"
                                            name="new_password"
                                            value={passwordData.new_password}
                                            onChange={handlePasswordChange}
                                        />
                                        <input
                                            type="text"
                                            placeholder="Confirm your new password"
                                            name="new_password_confirmation"
                                            value={passwordData.new_password_confirmation}
                                            onChange={handlePasswordChange}
                                        />
                                    </div>
                                </div>
                                <button type="submit">Update</button>
                                <button type="button" onClick={handleEdit}>Cancel</button>
                            </form>
                        </div>
                    ) : (
                        <div>
                            <h2>Change Password</h2>
                            <p>To change your password, please enter your current password and your new password
                                below.</p>
                            <button onClick={handleEdit}>Change Password</button>
                        </div>
                    )}
                </section>
                <section className='delete-account-section'>
                    <h2>Delete Account</h2>
                    <p>If you would like to delete your account, please click the button below.</p>
                    <button>Delete Account</button>
                </section>
            </section>
        </div>
    );
};

export default GeneralSettings;
