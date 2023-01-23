export const getParams = (selectedParams: string[]) => {
  let result;
  if (process.argv && Array.isArray(process.argv) && process.argv.length > 0) {
    result = process.argv.filter(x => {
      const param = x.split('=');
      const key = param[0];
      return selectedParams.includes(key)
    }).map(x => {
      const param = x.split('=');
      const [key, value] = [param[0], param[1]];
      return {
        [key]: value
      }
    });
  }
  console.log('result >>> ', result);
  return result?.reduce((prev, curr) => ({ ...prev, ...curr }), {});
};