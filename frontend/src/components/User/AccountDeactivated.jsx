import React from 'react'
import { Box, Typography, Button, Card, CardContent } from '@mui/material'
import { Block as BlockIcon } from '@mui/icons-material'
import { useAuth } from '../../context/AuthContext'
import MetaData from '../Layouts/MetaData'

export default function AccountDeactivated() {
	const { logout } = useAuth()

	const handleLogout = () => {
		logout()
		window.location.href = '/login'
	}

	return (
		<>
			<MetaData title="Account Deactivated" />
			<Box 
				sx={{ 
					minHeight: '100vh', 
					display: 'flex', 
					alignItems: 'center', 
					justifyContent: 'center',
					backgroundColor: '#f5f5f5',
					p: 2
				}}
			>
				<Card sx={{ maxWidth: 500, textAlign: 'center' }}>
					<CardContent sx={{ p: 4 }}>
						<BlockIcon 
							sx={{ 
								fontSize: 80, 
								color: 'error.main', 
								mb: 2 
							}} 
						/>
						
						<Typography variant="h4" gutterBottom color="error">
							Account Deactivated
						</Typography>
						
						<Typography variant="body1" sx={{ mb: 3, color: 'text.secondary' }}>
							Your account has been deactivated by an administrator. 
							You no longer have access to the system.
						</Typography>
						
						<Typography variant="body2" sx={{ mb: 4, color: 'text.secondary' }}>
							If you believe this is an error, please contact support or an administrator.
						</Typography>
						
						<Button 
							variant="contained" 
							color="primary"
							onClick={handleLogout}
							size="large"
						>
							Return to Login
						</Button>
					</CardContent>
				</Card>
			</Box>
		</>
	)
}
