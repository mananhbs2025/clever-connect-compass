
export interface ContactData {
  firstName?: string;
  lastName?: string;
  email?: string;
  company?: string;
  position?: string;
  location?: string;
  connectedOn?: string;
  profileUrl?: string;
  [key: string]: string | undefined;
}

export const parseCSV = (file: File): Promise<ContactData[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (event) => {
      try {
        const csvText = event.target?.result as string;
        const lines = csvText.split('\n');
        const headers = lines[0].split(',').map(header => header.trim().toLowerCase());
        
        const contacts: ContactData[] = lines.slice(1)
          .filter(line => line.trim() !== '')
          .map(line => {
            const values = line.split(',').map(value => value.trim());
            const contact: ContactData = {};
            
            // Map CSV headers to our contact fields
            headers.forEach((header, index) => {
              const value = values[index] || '';
              
              if (header.includes('first') && header.includes('name')) {
                contact.firstName = value;
              } else if (header.includes('last') && header.includes('name')) {
                contact.lastName = value;
              } else if (header.includes('email')) {
                contact.email = value;
              } else if (header.includes('company')) {
                contact.company = value;
              } else if (header.includes('position') || header.includes('title')) {
                contact.position = value;
              } else if (header.includes('location') || header.includes('city') || header.includes('state')) {
                contact.location = value;
              } else if (header.includes('connect') && header.includes('on')) {
                contact.connectedOn = value;
              } else if (header.includes('url') || header.includes('profile')) {
                contact.profileUrl = value;
              } else {
                // Store any other fields with their original header names
                contact[header] = value;
              }
            });
            
            return contact;
          });
        
        resolve(contacts);
      } catch (error) {
        reject(error);
      }
    };
    
    reader.onerror = (error) => reject(error);
    
    reader.readAsText(file);
  });
};
