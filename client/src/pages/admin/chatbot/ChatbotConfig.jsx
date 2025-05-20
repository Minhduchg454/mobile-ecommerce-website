import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import axios from 'axios';

const ChatbotConfig = () => {
    const [config, setConfig] = useState({
        welcomeMessage: '',
        theme: {
            primaryColor: '#4a90e2',
            secondaryColor: '#357abd',
            backgroundColor: '#ffffff',
            textColor: '#2c3e50'
        },
        avatar: '🤖',
        title: '',
        position: {
            bottom: 20,
            right: 20
        },
        size: {
            width: 380,
            height: 600
        },
        isActive: true
    });

    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchConfig();
    }, []);

    const fetchConfig = async () => {
        try {
            const response = await axios.get('/api/chatbot');
            setConfig(response.data);
        } catch (error) {
            console.error('Error fetching config:', error);
            toast.error('Không thể tải cấu hình chatbot');
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name.includes('.')) {
            const [parent, child] = name.split('.');
            setConfig(prev => ({
                ...prev,
                [parent]: {
                    ...prev[parent],
                    [child]: value
                }
            }));
        } else {
            setConfig(prev => ({
                ...prev,
                [name]: value
            }));
        }
    };

    const handleNumberChange = (e) => {
        const { name, value } = e.target;
        const [parent, child] = name.split('.');
        setConfig(prev => ({
            ...prev,
            [parent]: {
                ...prev[parent],
                [child]: parseInt(value) || 0
            }
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await axios.put('/api/chatbot', config);
            toast.success('Cập nhật cấu hình thành công');
        } catch (error) {
            console.error('Error updating config:', error);
            toast.error('Không thể cập nhật cấu hình');
        }
        setLoading(false);
    };

    const handleToggle = async () => {
        try {
            const response = await axios.put('/api/chatbot/toggle');
            setConfig(prev => ({
                ...prev,
                isActive: response.data.isActive
            }));
            toast.success(`Chatbot đã được ${response.data.isActive ? 'bật' : 'tắt'}`);
        } catch (error) {
            console.error('Error toggling chatbot:', error);
            toast.error('Không thể thay đổi trạng thái chatbot');
        }
    };

    return (
        <div className="p-4">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Cấu hình Chatbot</h1>
                <button
                    onClick={handleToggle}
                    className={`px-4 py-2 rounded ${
                        config.isActive
                            ? 'bg-red-500 hover:bg-red-600'
                            : 'bg-green-500 hover:bg-green-600'
                    } text-white`}
                >
                    {config.isActive ? 'Tắt Chatbot' : 'Bật Chatbot'}
                </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Thông tin cơ bản */}
                    <div className="space-y-4">
                        <h2 className="text-xl font-semibold">Thông tin cơ bản</h2>
                        
                        <div>
                            <label className="block text-sm font-medium mb-1">
                                Tin nhắn chào mừng
                            </label>
                            <textarea
                                name="welcomeMessage"
                                value={config.welcomeMessage}
                                onChange={handleChange}
                                className="w-full p-2 border rounded"
                                rows="3"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1">
                                Avatar
                            </label>
                            <input
                                type="text"
                                name="avatar"
                                value={config.avatar}
                                onChange={handleChange}
                                className="w-full p-2 border rounded"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1">
                                Tiêu đề
                            </label>
                            <input
                                type="text"
                                name="title"
                                value={config.title}
                                onChange={handleChange}
                                className="w-full p-2 border rounded"
                            />
                        </div>
                    </div>

                    {/* Màu sắc */}
                    <div className="space-y-4">
                        <h2 className="text-xl font-semibold">Màu sắc</h2>
                        
                        <div>
                            <label className="block text-sm font-medium mb-1">
                                Màu chính
                            </label>
                            <div className="flex items-center gap-2">
                                <input
                                    type="color"
                                    name="theme.primaryColor"
                                    value={config.theme.primaryColor}
                                    onChange={handleChange}
                                    className="w-12 h-12 p-1 border rounded"
                                />
                                <input
                                    type="text"
                                    name="theme.primaryColor"
                                    value={config.theme.primaryColor}
                                    onChange={handleChange}
                                    className="flex-1 p-2 border rounded"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1">
                                Màu phụ
                            </label>
                            <div className="flex items-center gap-2">
                                <input
                                    type="color"
                                    name="theme.secondaryColor"
                                    value={config.theme.secondaryColor}
                                    onChange={handleChange}
                                    className="w-12 h-12 p-1 border rounded"
                                />
                                <input
                                    type="text"
                                    name="theme.secondaryColor"
                                    value={config.theme.secondaryColor}
                                    onChange={handleChange}
                                    className="flex-1 p-2 border rounded"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1">
                                Màu nền
                            </label>
                            <div className="flex items-center gap-2">
                                <input
                                    type="color"
                                    name="theme.backgroundColor"
                                    value={config.theme.backgroundColor}
                                    onChange={handleChange}
                                    className="w-12 h-12 p-1 border rounded"
                                />
                                <input
                                    type="text"
                                    name="theme.backgroundColor"
                                    value={config.theme.backgroundColor}
                                    onChange={handleChange}
                                    className="flex-1 p-2 border rounded"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1">
                                Màu chữ
                            </label>
                            <div className="flex items-center gap-2">
                                <input
                                    type="color"
                                    name="theme.textColor"
                                    value={config.theme.textColor}
                                    onChange={handleChange}
                                    className="w-12 h-12 p-1 border rounded"
                                />
                                <input
                                    type="text"
                                    name="theme.textColor"
                                    value={config.theme.textColor}
                                    onChange={handleChange}
                                    className="flex-1 p-2 border rounded"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Vị trí và kích thước */}
                    <div className="space-y-4">
                        <h2 className="text-xl font-semibold">Vị trí</h2>
                        
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">
                                    Khoảng cách dưới (px)
                                </label>
                                <input
                                    type="number"
                                    name="position.bottom"
                                    value={config.position.bottom}
                                    onChange={handleNumberChange}
                                    className="w-full p-2 border rounded"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">
                                    Khoảng cách phải (px)
                                </label>
                                <input
                                    type="number"
                                    name="position.right"
                                    value={config.position.right}
                                    onChange={handleNumberChange}
                                    className="w-full p-2 border rounded"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <h2 className="text-xl font-semibold">Kích thước</h2>
                        
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">
                                    Chiều rộng (px)
                                </label>
                                <input
                                    type="number"
                                    name="size.width"
                                    value={config.size.width}
                                    onChange={handleNumberChange}
                                    className="w-full p-2 border rounded"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">
                                    Chiều cao (px)
                                </label>
                                <input
                                    type="number"
                                    name="size.height"
                                    value={config.size.height}
                                    onChange={handleNumberChange}
                                    className="w-full p-2 border rounded"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex justify-end">
                    <button
                        type="submit"
                        disabled={loading}
                        className="px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
                    >
                        {loading ? 'Đang lưu...' : 'Lưu cấu hình'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default ChatbotConfig; 