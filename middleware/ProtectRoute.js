import jwt from "jsonwebtoken";

const protectRoute = (req, res, next) => {
  try {
    const authHeader = req.headers?.authorization;
    console.log("this is token :",authHeader) 
      
    console.log("this is Auth :" , req.headers.authorization)

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "No token provided or invalid format", success: false });
    }

    const token = authHeader.split("Bearer ")[1];

    const decoded = jwt.verify(token, process.env.JWT_KEY);
    req.user = decoded.id;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Token verification failed", success: false, error: error.message });
  }
};

export default protectRoute;
