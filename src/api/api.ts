import { request } from '@/utils';

export default {
  upload: (data: object, otherOptions = {}) => {
    return request({
      url: '/upload/common',
      method: 'post',
      data,
      ...otherOptions,
    });
  },

  submit: (data: object) => request({ url: '/submit', method: 'post', data }),
};
