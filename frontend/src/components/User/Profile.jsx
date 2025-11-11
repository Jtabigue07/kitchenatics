import React, { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { updateProfileApi, meApi } from '../../utils/api'
import Header from '../Layouts/Header'
import Footer from '../Layouts/Footer'
import MetaData from '../Layouts/MetaData'

export default function Profile() {
    const auth = useAuth()
    const [name, setName] = useState('')
    const [password, setPassword] = useState('')
    const [avatar, setAvatar] = useState(null)
    const [phone, setPhone] = useState('')
    const [address, setAddress] = useState('')
    const [zipCode, setZipCode] = useState('')
    const [gender, setGender] = useState('')
    const [dateOfBirth, setDateOfBirth] = useState('')
    const [loading, setLoading] = useState(false)
    const [message, setMessage] = useState('')

    useEffect(() => {
        if (auth.user) {
            setName(auth.user.name || '')
            setPhone(auth.user.phone || '')
            setAddress(auth.user.address || '')
            setZipCode(auth.user.zipCode || '')
            setGender(auth.user.gender || '')
            setDateOfBirth(auth.user.dateOfBirth ? new Date(auth.user.dateOfBirth).toISOString().split('T')[0] : '')
        }
    }, [auth.user])

    const handleSubmit = async (e) => {
        e.preventDefault()
        setMessage('')
        setLoading(true)
        try {
            const token = auth.token
            const res = await updateProfileApi({
                token,
                name,
                password: password || undefined,
                avatarFile: avatar,
                phone: phone || undefined,
                address: address || undefined,
                zipCode: zipCode || undefined,
                gender: gender || undefined,
                dateOfBirth: dateOfBirth || undefined
            })
            const updated = res.user
            // Update auth context's user
            auth.login(token, {
                id: updated.id,
                name: updated.name,
                email: updated.email,
                role: updated.role,
                emailVerified: updated.emailVerified,
                avatar: updated.avatar,
                phone: updated.phone,
                address: updated.address,
                zipCode: updated.zipCode,
                gender: updated.gender,
                dateOfBirth: updated.dateOfBirth
            })
            setMessage('Profile updated')
            setPassword('')
        } catch (err) {
            setMessage(err.message || 'Update failed')
        } finally {
            setLoading(false)
        }
    }

    return (
        <>
            <MetaData title="Edit Profile" />
            <Header />
            <div style={{ maxWidth: 720, margin: '40px auto', padding: 16 }}>
                <h2>Edit Profile</h2>
                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: 12 }}>
                        <label>Email</label>
                        <input value={auth.user?.email || ''} disabled style={{ width: '100%', padding: 8, backgroundColor: '#f5f5f5' }} />
                    </div>
                    <div style={{ marginBottom: 12 }}>
                        <label>Name</label>
                        <input value={name} onChange={(e) => setName(e.target.value)} required style={{ width: '100%', padding: 8 }} />
                    </div>
                    <div style={{ marginBottom: 12 }}>
                        <label>Phone</label>
                        <input value={phone} onChange={(e) => setPhone(e.target.value)} style={{ width: '100%', padding: 8 }} />
                    </div>
                    <div style={{ marginBottom: 12 }}>
                        <label>Address</label>
                        <input value={address} onChange={(e) => setAddress(e.target.value)} style={{ width: '100%', padding: 8 }} />
                    </div>
                    <div style={{ marginBottom: 12 }}>
                        <label>ZIP Code</label>
                        <input value={zipCode} onChange={(e) => setZipCode(e.target.value)} style={{ width: '100%', padding: 8 }} />
                    </div>
                    <div style={{ marginBottom: 12 }}>
                        <label>Gender</label>
                        <select value={gender} onChange={(e) => setGender(e.target.value)} style={{ width: '100%', padding: 8 }}>
                            <option value="">Select Gender</option>
                            <option value="male">Male</option>
                            <option value="female">Female</option>
                            <option value="other">Other</option>
                            <option value="prefer-not-to-say">Prefer not to say</option>
                        </select>
                    </div>
                    <div style={{ marginBottom: 12 }}>
                        <label>Date of Birth</label>
                        <input type="date" value={dateOfBirth} onChange={(e) => setDateOfBirth(e.target.value)} style={{ width: '100%', padding: 8 }} />
                    </div>
                    <div style={{ marginBottom: 12 }}>
                        <label>New Password (leave blank to keep)</label>
                        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} style={{ width: '100%', padding: 8 }} />
                    </div>
                    <div style={{ marginBottom: 12 }}>
                        <label>Avatar</label>
                        <input type="file" accept="image/*" onChange={(e) => setAvatar(e.target.files?.[0] || null)} />
                    </div>
                    {message ? <div style={{ marginBottom: 12 }}>{message}</div> : null}
                    <button type="submit" disabled={loading} style={{ padding: 10, backgroundColor: '#4CAF50', color: 'white', border: 'none', borderRadius: 4 }}>
                        {loading ? 'Saving…' : 'Save changes'}
                    </button>
                </form>
            </div>
            <Footer />
        </>
    )
}
