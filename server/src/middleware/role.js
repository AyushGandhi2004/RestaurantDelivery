
//Note that the role is an array because we might want to give access to multiple roles
export const requireRole = (...role) => {
    return (req, res, next) => {
        if(!req.user){
            return res.status(401).json({
                success : false,
                message : "Not Authenticated"
            });
        }
        if(!role.includes(req.user.role)){
            return res.status(403).json({
                success : false,
                message : "Access Denied"
            });
        }
        next();
    };
};