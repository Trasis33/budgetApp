// useExpenseCreateForm (scaffold)
// Phase 3.1: Placeholder returning static shape. Logic (validation, dirty tracking, submit orchestration)
// will be implemented in tasks T020, T021, T027, etc.

import { useCallback, useReducer } from 'react';
import { validateRatios } from '../utils/ratioValidation';

const initialState = {
  fields: {
    amount: '',
    category_id: '',
    paid_by_user_id: '',
    date: '',
    split_type: '50/50',
    split_ratio_user1: '',
    split_ratio_user2: '',
    description: ''
  },
  errors: {},
  dirty: false,
  submitting: false
};

function reducer(state, action) {
  switch (action.type) {
    case 'SET_FIELD': {
      const fields = { ...state.fields, [action.name]: action.value };
      // Live description length guard
      const errors = { ...state.errors };
      if (action.name === 'description') {
        if (action.value.length > 140) {
          errors.description = 'Exceeds 140 character limit';
        } else if (errors.description) {
          delete errors.description;
        }
      }
      if (action.name === 'split_ratio_user1' || action.name === 'split_ratio_user2' || action.name === 'split_type') {
        if (fields.split_type === 'custom') {
          const { valid } = validateRatios(Number(fields.split_ratio_user1), Number(fields.split_ratio_user2));
          if (!valid) errors.split = 'must sum 100'; else delete errors.split;
        } else if (errors.split) {
          delete errors.split;
        }
      }
      return { ...state, fields, dirty: true, errors };
    }
    case 'SET_ERRORS':
      return { ...state, errors: action.errors };
    case 'SET_SUBMITTING':
      return { ...state, submitting: action.value };
    case 'RESET_KEEP_PERSIST': {
        const { keep } = action;
        const preserved = {
          category_id: state.fields.category_id,
          paid_by_user_id: state.fields.paid_by_user_id,
          split_type: state.fields.split_type,
          split_ratio_user1: state.fields.split_ratio_user1,
          split_ratio_user2: state.fields.split_ratio_user2
        };
        return {
          ...state,
          fields: {
            ...state.fields,
            amount: '',
            description: '',
            date: '',
            ...(keep ? preserved : {})
          },
          errors: {},
          submitting: false,
          dirty: false
        };
    }
    default:
      return state;
  }
}

export function useExpenseCreateForm() {
  const [state, dispatch] = useReducer(reducer, initialState);

  const validate = useCallback(() => {
    const { fields } = state;
    const errors = {};
    // Amount
    if (!fields.amount) {
      errors.amount = 'Amount required';
    } else if (Number(fields.amount) <= 0) {
      errors.amount = 'Must be greater than 0';
    }
    // Description length
    if (fields.description && fields.description.length > 140) {
      errors.description = 'Exceeds 140 character limit';
    }
    // Split ratios if custom
    if (fields.split_type === 'custom') {
      const r1 = Number(fields.split_ratio_user1);
      const r2 = Number(fields.split_ratio_user2);
      const { valid } = validateRatios(r1, r2);
        if (!valid) {
          errors.split = 'must sum 100';
      }
    }
    dispatch({ type: 'SET_ERRORS', errors });
    return errors;
  }, [state]);

  const setField = useCallback((name, value) => {
    dispatch({ type: 'SET_FIELD', name, value });
  }, []);

  const submit = useCallback(async (onValid) => {
    const errs = validate();
    if (Object.keys(errs).length) return { ok: false, errors: errs };
    dispatch({ type: 'SET_SUBMITTING', value: true });
    try {
      await onValid(state.fields);
      return { ok: true };
    } finally {
      dispatch({ type: 'SET_SUBMITTING', value: false });
    }
  }, [state.fields, validate]);

  return {
    ...state,
    setField,
    validate,
    submit
  };
}

export default useExpenseCreateForm;
