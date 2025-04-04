
export interface ContactData {
  name?: string;
  email?: string;
  [key: string]: string | undefined;
}

export const parseCSV = (file: File): Promise<ContactData[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (event) => {
      const csvText = event.target?.result as string;
      const lines = csvText.split('\n');
      const headers = lines[0].split(',').map(header => header.trim().toLowerCase());
      
      const contacts: ContactData[] = lines.slice(1)
        .filter(line => line.trim() !== '')
        .map(line => {
          const values = line.split(',').map(value => value.trim());
          return headers.reduce((obj, header, index) => {
            obj[header] = values[index];
            return obj;
          }, {} as ContactData);
        });
      
      resolve(contacts);
    };
    
    reader.onerror = (error) => reject(error);
    
    reader.readAsText(file);
  });
};
