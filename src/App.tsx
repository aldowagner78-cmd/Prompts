import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import Dashboard from "./pages/Dashboard"
import Editor from "./pages/Editor"
import Library from "./pages/Library"
import Help from "./pages/Help"
import Settings from "./pages/Settings"
import Templates from "./pages/Templates"
import History from "./pages/History"


import { AuthProvider } from "./contexts/AuthContext"
import { ThemeProvider } from "./contexts/ThemeContext"
import ProtectedRoute from "./components/ProtectedRoute"
import Login from "./pages/Login"

function App() {
    return (
        <ThemeProvider>
            <AuthProvider>
                <Router>
                    <Routes>
                        <Route path="/login" element={<Login />} />
                        <Route
                            path="/"
                            element={
                                <ProtectedRoute>
                                    <Dashboard />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/editor"
                            element={
                                <ProtectedRoute>
                                    <Editor />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/library"
                            element={
                                <ProtectedRoute>
                                    <Library />
                                </ProtectedRoute>
                            }
                        />
                        <Route path="/help" element={<Help />} />
                        <Route
                            path="/settings"
                            element={
                                <ProtectedRoute>
                                    <Settings />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/templates"
                            element={
                                <ProtectedRoute>
                                    <Templates />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/history"
                            element={
                                <ProtectedRoute>
                                    <History />
                                </ProtectedRoute>
                            }
                        />
                    </Routes>
                </Router>
            </AuthProvider>
        </ThemeProvider>
    )
}

export default App
