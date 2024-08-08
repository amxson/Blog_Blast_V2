import { Button, Spinner } from 'flowbite-react';
import { useEffect, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import CommentSection from '../components/CommentSection';
import PostCard from '../components/PostCard';
import { FaHeart } from 'react-icons/fa';
import { useSelector } from 'react-redux';

export default function PostPage() {
  const { postSlug } = useParams();
  const navigate = useNavigate();
  const currentUser = useSelector((state) => state.user.currentUser);
  const [user, setUser] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [post, setPost] = useState(null);
  const [liked, setLiked] = useState(false);
  const [recentPosts, setRecentPosts] = useState([]);
  const [following, setFollowing] = useState(false);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/post/getposts?slug=${postSlug}`);
        if (res.status === 401) {
          navigate('/sign-in');
          return;
        }
        const data = await res.json();
        if (!res.ok) {
          setError(true);
          setLoading(false);
          return;
        }
        setPost(data.posts[0]);
        setLoading(false);
        setError(false);
      } catch (error) {
        setError(true);
        setLoading(false);
      }
    };
    fetchPost();
  }, [postSlug, navigate]);

  useEffect(() => {
    if (post && post.userId) {
      const getUser = async () => {
        try {
          const res = await fetch(`/api/user/${post.userId}`);
          if (res.status === 401) {
            navigate('/sign-in');
            return;
          }
          const data = await res.json();
          if (res.ok) {
            setUser(data);
            if (currentUser) {
              setFollowing(data.followers.includes(currentUser._id));
            }
          }
        } catch (error) {
          console.log(error.message);
        }
      };
      getUser();
    }
  }, [post, currentUser, navigate]);

  useEffect(() => {
    const fetchRecentPosts = async () => {
      try {
        const res = await fetch(`/api/post/getposts?limit=3`);
        if (res.status === 401) {
          navigate('/sign-in');
          return;
        }
        const data = await res.json();
        if (res.ok) {
          // Fetch user information for each recent post
          const recentPostsWithUser = await Promise.all(
            data.posts.map(async (recentPost) => {
              const userRes = await fetch(`/api/user/${recentPost.userId}`);
              const userData = await userRes.json();
              return { ...recentPost, user: userData };
            })
          );
          setRecentPosts(recentPostsWithUser);
        }
      } catch (error) {
        console.log(error.message);
      }
    };
    fetchRecentPosts();
  }, [navigate]);

  useEffect(() => {
    if (post && currentUser) {
      setLiked(post.likes.includes(currentUser._id));
    }
  }, [post, currentUser]);

  const handleLike = async () => {
    if (!currentUser) {
      navigate('/sign-in');
      return;
    }

    try {
      const res = await fetch(`/api/post/likePost/${post._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: currentUser._id }),
      });
      if (res.status === 401) {
        navigate('/sign-in');
        return;
      }
      const updatedPost = await res.json();
      setPost(updatedPost);
      setLiked(!liked);
    } catch (error) {
      console.log(error.message);
    }
  };

  const handleFollow = async () => {
    if (!currentUser) {
      navigate('/sign-in');
      return;
    }

    if (following) return;

    try {
      const res = await fetch(`/api/user/follow/${user._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      });
      if (res.status === 401) {
        navigate('/sign-in');
        return;
      }
      if (res.ok) {
        setFollowing(true);
      } else {
        const data = await res.json();
        console.log(data.message);
      }
    } catch (error) {
      console.log(error.message);
    }
  };

  const handleUnfollow = async () => {
    if (!currentUser || !following) return;

    try {
      const res = await fetch(`/api/user/unfollow/${user._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      });
      if (res.status === 401) {
        navigate('/sign-in');
        return;
      }
      if (res.ok) {
        setFollowing(false);
      } else {
        const data = await res.json();
        console.log(data.message);
      }
    } catch (error) {
      console.log(error.message);
    }
  };

  if (loading)
    return (
      <div className='flex justify-center items-center min-h-screen'>
        <Spinner size='xl' />
      </div>
    );

  if (error)
    return (
      <div className='flex justify-center items-center min-h-screen'>
        <p>Error loading post</p>
      </div>
    );

  return (
    <main className='p-3 flex flex-col max-w-6xl mx-auto min-h-screen'>
      <h1 className='text-3xl mt-10 p-3 text-center font-serif max-w-2xl mx-auto lg:text-4xl'>
        {post && post.title}
      </h1>
      
      {/* Author Information */}
      {user && (
        <div className='flex items-center justify-center mt-5'>
          <p className='text-center flex items-center'>
            <span className='mr-3'>By:</span>
            <Link to={`/user/${user._id}`} className='flex items-center'>
              <img
                src={user.profilePicture || 'default-profile-picture-url'}
                alt={user.username}
                className='w-12 h-12 rounded-full object-cover mr-3'
              />
              <strong>{user.username}</strong>
            </Link>

          </p>
          {currentUser && user._id !== currentUser._id && (
            <Button
              color={following ? 'gray' : 'blue'}
              className='ml-4'
              onClick={following ? handleUnfollow : handleFollow}
            >
              {following ? 'Unfollow' : 'Follow'}
            </Button>
          )}
        </div>
      )}

      {/* Tags Section */}
      <div className='flex flex-wrap gap-2 mt-4 justify-center'>
        {post && post.tags && post.tags.length > 0 ? (
          post.tags.map((tag, index) => (
            <Link key={index} to={`/search?tag=${tag}`}>
              <Button color='gray' pill size='xs'>
                #{tag}
              </Button>
            </Link>
          ))
        ) : (
          <p>No tags available</p>
        )}
      </div>

      <Link
        to={`/search?category=${post && post.category}`}
        className='self-center mt-5'
      >
        <Button color='gray' pill size='xs'>
          {post && post.category}
        </Button>
      </Link>

      <img
        src={post && post.image}
        alt={post && post.title}
        className='mt-10 p-3 max-w-2xl mx-auto w-full object-cover'
      />

      <div className='flex justify-between p-3 border-b border-slate-500 mx-auto w-full max-w-2xl text-xs'>
        <span>{post && new Date(post.createdAt).toLocaleDateString()}</span>
        <span className='italic'>
          {post && (post.content.length / 1000).toFixed(0)} mins read
        </span>
      </div>
      <div
        className='p-3 max-w-2xl mx-auto w-full post-content'
        dangerouslySetInnerHTML={{ __html: post && post.content }}>

        </div>
 
        <div className='flex items-center  w-full post-content p-3 max-w-2xl mx-auto'>
  <button
    onClick={handleLike}
    className='mr-2 p-2'
  >
    <FaHeart
      className={`w-6 h-6 ${liked ? 'text-red-500' : 'text-gray-500'}`}
    />
  </button>
  <span>{post && post.numberOfLikes} likes</span>
</div>




      <CommentSection postId={post && post._id} />

      <div className='flex flex-col justify-center items-center mb-5'>
        <h1 className='text-xl mt-5'>Recent articles</h1>
        <div className='flex flex-wrap gap-5 mt-5 justify-center'>
          {recentPosts &&
            recentPosts.map((recentPost) => (
              <PostCard
                key={recentPost._id}
                post={recentPost}
                user={recentPost.user}
              />
            ))}
        </div>
      </div>
    </main>
  );
}
