export const PATHS = {
  auth: '/auth',
  login: '/login',
  mi: '/mi',
  register: '/register',
};

const err = 'Error:';
const succ = 'Success:';

export const STATIC_CONTENT = {
  mi: {
    get: {
      failure: `${err} There was an issue fetching the user data.`,
      not_found: `${err} No user data was found.`,
      success: `${succ} User was found.`,
    },
    update: {
      failure: `${err} There was an issue updating the user data.`,
      not_found: `${err} No user data was found to be able to update.`,
      same_pw: `${err} Cannot use the same password as previously entered.`,
      success: `${succ} User was updated.`,
    },
  },
};
