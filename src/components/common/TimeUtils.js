export const timeUtils = (timeString) => {
    if (!timeString) return '';
  
    const timeComponents = timeString.split(':');
    if (timeComponents.length < 2) return '';
  
    const hours = parseInt(timeComponents[0], 10);
    const minutes = parseInt(timeComponents[1], 10);
  
    if (isNaN(hours) || isNaN(minutes)) return '';
  
    const time = new Date();
    time.setHours(hours);
    time.setMinutes(minutes);
  
    const formattedHours = time.getHours().toString().padStart(2, '0');
    const formattedMinutes = time.getMinutes().toString().padStart(2, '0');
  
    return `${formattedHours}:${formattedMinutes}`;
  };
  
  export default timeUtils;