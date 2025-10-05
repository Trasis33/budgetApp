import { validateRatios } from '../utils/ratioValidation';

export const expenseCreateInitialState = {
  fields: {
    amount: '', category_id: '', paid_by_user_id: '', date: '',
    split_type: '50/50', split_ratio_user1: '', split_ratio_user2: '', description: ''
  },
  errors: {}, dirty: false, submitting: false
};

export function expenseCreateReducer(state, action) {
  switch (action.type) {
    case 'SET_FIELD': {
      const fields = { ...state.fields, [action.name]: action.value };
      const errors = { ...state.errors };
      if (action.name === 'description') {
        if (action.value.length > 140) errors.description = 'Exceeds 140 character limit';
        else delete errors.description;
      }
      if (['split_ratio_user1','split_ratio_user2','split_type'].includes(action.name)) {
        if (fields.split_type === 'custom') {
          const { valid } = validateRatios(Number(fields.split_ratio_user1), Number(fields.split_ratio_user2));
            if (!valid) errors.split = 'must sum 100'; else delete errors.split;
        } else delete errors.split;
      }
      return { ...state, fields, dirty: true, errors };
    }
    case 'SET_ERRORS': return { ...state, errors: action.errors };
    case 'SET_SUBMITTING': return { ...state, submitting: action.value };
    case 'RESET_KEEP_PERSIST': {
      const preserved = {
        category_id: state.fields.category_id,
        paid_by_user_id: state.fields.paid_by_user_id,
        split_type: state.fields.split_type,
        split_ratio_user1: state.fields.split_ratio_user1,
        split_ratio_user2: state.fields.split_ratio_user2
      };
      return { ...state, fields: { ...state.fields, amount:'', description:'', date:'', ...preserved }, errors:{}, submitting:false, dirty:false };
    }
    default: return state;
  }
}
