export const companyInfoStyles = {
  companyInfo: {
    backgroundColor: '#2c2c2c',
    borderRadius: '8px',
    padding: '20px',
    marginTop: '20px',
    boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
  },
  infoGrid: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: '20px',
    flexWrap: 'wrap' as const,
  },
  infoItem: {
    display: 'flex',
    flexDirection: 'row' as const,
    alignItems: 'center',
    gap: '10px',
    flex: '1',
    minWidth: '200px',
  },
  infoLabel: {
    fontSize: '0.9rem',
    color: '#a0a0a0',
    fontWeight: '500',
  },
  infoValue: {
    fontSize: '1rem',
    color: '#fff',
  },
};