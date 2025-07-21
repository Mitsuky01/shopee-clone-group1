const dashboard = () => {
  const db = getFirestore(app);
  const auth = getAuth(app);

  const user = auth.currentUser;
  if (!user) {
    return <div>Please log in to access the dashboard.</div>;
  }

  return <h1></h1>;
};

export default dashboard;
