import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const GoogleAuthCallback = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const query = new URLSearchParams(location.search);
    const token = query.get('token');
    const user = query.get('user');
    const error = query.get('error');

    if (error) {
      alert(decodeURIComponent(error));
      navigate('/');
      return;
    }

    if (token && user) {
      try {
        const userData = JSON.parse(user);

        // Kiểm tra trạng thái tài khoản
        const userStatus = userData.uStatus || userData.UStatus || "Active";
        if (userStatus.toLowerCase() !== "active") {
          alert("Tài khoản của bạn đã bị khóa. Vui lòng liên hệ admin để được hỗ trợ.");
          navigate('/');
          return;
        }

        localStorage.setItem('token', token);
        localStorage.setItem('user', user);

        // Điều hướng dựa trên role
        const roleId = userData.roleId || userData.RoleId || 0;
        if (roleId === 3) {
          navigate("/users_manager");
        } else if (roleId === 2 || roleId === 4) {
          navigate("/facility_manager");
        } else {
          navigate("/homepage");
        }
      } catch (parseError) {
        console.error("Error parsing user data:", parseError);
        navigate('/');
      }
    } else {
      navigate('/');
    }
  }, [location, navigate]);

  return <div className="text-center p-10 text-gray-600">Đang xử lý đăng nhập...</div>;
};


export default GoogleAuthCallback;
