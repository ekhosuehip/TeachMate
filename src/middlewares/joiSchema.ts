import Joi from 'joi';

export const preSignedUrlSchema = Joi.object({
  fileName: Joi.string().max(100).required().messages({
    'string.empty': 'filename is required.',
    'string.max': 'filename must not exceed 100 characters.',
  }),
  contentType: Joi.string().max(50).required().messages({
    'string.empty': 'contentType is required.',
    'string.max': 'contentType must not exceed 50 characters.',
  }),
}).required().messages({
  'object.base': 'Request body must be an object and cannot be empty',
  'any.required': 'Request body is required',
});
