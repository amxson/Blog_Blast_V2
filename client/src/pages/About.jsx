export default function About() {
  return (
    <div className='min-h-screen flex items-center justify-center'>
      <div className='max-w-2xl mx-auto p-3 text-center'>
        <div>
          <h1 className='text-3xl font font-semibold text-center my-7'>
            About Team Red's Blog
          </h1>
          <div className='text-md text-gray-500 flex flex-col gap-6'>
            <p>
              Welcome to Team Red's Blog! This blog was created by Team Red as a
              collaborative project to bring together technology enthusiasts and
              provide a platform for sharing thoughts and ideas.
            </p>

            <p>
              Our team consists of five members, each contributing their unique
              skills to this project. Bemnet focused on UI/UX design with Figma,
              ensuring a seamless and engaging user experience. Amar, Daniel, and
              Hana worked on developing the MERN stack, implementing features such
              as user authentication, CRUD functionality for posts and comments,
              and interactive blog management. Mikiyas integrated an AI chatbot to
              enhance user interaction.
            </p>

            <p>
              On this blog, you'll find a variety of articles and posts, with
              options to create, manage, and interact with content. Users can follow
              authors, comment on posts, and enjoy a dynamic and responsive
              experience. We encourage you to explore, engage, and contribute to
              our community.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
