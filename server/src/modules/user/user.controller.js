const userService = require("./user.service");

exports.getCurrent = async (req, res, next) => {
  try {
    //Truyen qua query ?id=... =>req.query
    //Truyen qua params url: /__/__/current/:id
    const result = await userService.getCurrent(req.body, req.user);
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
};

exports.updateUser = async (req, res, next) => {
  try {
    const { uId } = req.params;
    const result = await userService.updateUser(uId, req.body, req.file);
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
};
