import { supabase } from './supabase';

/**
 * Generates a unique Login ID based on the role and prefix.
 * Format:
 * - Student: STU-YYYY-XXX
 * - Teacher: TCH-SUBJECT-XXX
 * - Principal: PRN-XXX
 */
export async function generateUniqueId(prefix: string): Promise<string> {
  // Query for the highest ID with this prefix
  // We use like 'prefix%' and order by id descending to get the latest one
  const { data, error } = await supabase
    .from('users')
    .select('id')
    .like('id', `${prefix}%`)
    .order('id', { ascending: false })
    .limit(1);

  if (error) {
    console.error('Error fetching latest ID:', error);
    return `${prefix}001`;
  }

  if (!data || data.length === 0) {
    return `${prefix}001`;
  }

  const latestId = data[0].id;
  const parts = latestId.split('-');
  const lastPart = parts[parts.length - 1];
  const currentNum = parseInt(lastPart, 10);
  
  if (isNaN(currentNum)) {
    return `${prefix}001`;
  }

  const nextNum = currentNum + 1;
  const nextId = `${prefix}${nextNum.toString().padStart(3, '0')}`;

  // Recursive check just in case of race conditions or gaps
  // though ORDER BY DESC LIMIT 1 should generally be sufficient for simple apps
  const { data: exists } = await supabase
    .from('users')
    .select('id')
    .eq('id', nextId)
    .maybeSingle();

  if (exists) {
    // If somehow it exists (maybe a gap or manual entry), we could try to find the next one
    // But for this requirement, let's keep it simple or increment further
    return findNextAvailableId(prefix, nextNum);
  }

  return nextId;
}

async function findNextAvailableId(prefix: string, startNum: number): Promise<string> {
  let currentNum = startNum;
  let exists = true;
  let nextId = '';

  while (exists) {
    currentNum++;
    nextId = `${prefix}${currentNum.toString().padStart(3, '0')}`;
    const { data } = await supabase
      .from('users')
      .select('id')
      .eq('id', nextId)
      .maybeSingle();
    
    if (!data) {
      exists = false;
    }
    
    // Safety break
    if (currentNum > startNum + 100) break;
  }

  return nextId;
}
