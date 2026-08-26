import { useEffect, useState } from 'react';
import DashboardCard from '../../components/common/DashboardCard.jsx';
import QuickActionCard from '../../components/common/QuickActionCard.jsx';
import LoadingSpinner from '../../components/common/LoadingSpinner.jsx';
import ErrorMessage from '../../components/common/ErrorMessage.jsx';
import KnowledgeUploadPanel from '../../components/common/KnowledgeUploadPanel.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { adminService } from '../../services/adminService.js';

const departmentOptions = [
  { id: 1, code: 'SET', name: 'School of Engineering and Technology' },
  { id: 2, code: 'SCA', name: 'School of Computer Applications' },
  { id: 3, code: 'SOM', name: 'School of Management' },
  { id: 4, code: 'SOC', name: 'School of Commerce' },
  { id: 5, code: 'SOP', name: 'School of Pharmacy' }
];

const courseOptions = [
  { id: 1, departmentId: 1, name: 'B.Tech' },
  { id: 2, departmentId: 1, name: 'M.Tech' },
  { id: 3, departmentId: 2, name: 'BCA' },
  { id: 4, departmentId: 2, name: 'MCA' },
  { id: 5, departmentId: 3, name: 'BBA' },
  { id: 6, departmentId: 3, name: 'MBA' },
  { id: 7, departmentId: 4, name: 'B.Com' },
  { id: 8, departmentId: 5, name: 'B.Pharm' }
];

const branchOptions = [
  { id: 1, courseId: 1, name: 'Computer Science and Engineering' },
  { id: 2, courseId: 1, name: 'Computer Science and Engineering (Data Science)' },
  { id: 3, courseId: 1, name: 'Computer Science and Engineering (AI & ML)' },
  { id: 4, courseId: 1, name: 'Information Technology' },
  { id: 5, courseId: 1, name: 'Electronics and Communication Engineering' },
  { id: 6, courseId: 1, name: 'Mechanical Engineering' },
  { id: 7, courseId: 1, name: 'Civil Engineering' },
  { id: 8, courseId: 2, name: 'Computer Science' },
  { id: 9, courseId: 2, name: 'Structural Engineering' },
  { id: 10, courseId: 3, name: 'General' },
  { id: 11, courseId: 3, name: 'Data Analytics' },
  { id: 12, courseId: 4, name: 'Computer Applications' },
  { id: 13, courseId: 5, name: 'General Management' },
  { id: 14, courseId: 5, name: 'Business Analytics' },
  { id: 15, courseId: 6, name: 'Finance' },
  { id: 16, courseId: 6, name: 'Marketing' },
  { id: 17, courseId: 6, name: 'Human Resource' },
  { id: 18, courseId: 7, name: 'Commerce' },
  { id: 19, courseId: 8, name: 'Pharmacy' }
];

export default function AdminDashboard() {
  const { user } = useAuth();
  const [students, setStudents] = useState([]);
  const [facultyCount, setFacultyCount] = useState(0);
  const [departments, setDepartments] = useState(departmentOptions);
  const [courseCount, setCourseCount] = useState(courseOptions.length);
  const [courses, setCourses] = useState(courseOptions);
  const [branches, setBranches] = useState(branchOptions);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');
  const [registrationRole, setRegistrationRole] = useState(null);
  const [registrationForm, setRegistrationForm] = useState({ name: '', email: '', password: '', departmentId: '', courseId: '', branchId: '', gender: 'MALE', designation: 'LECTURER' });
  const [registrationLoading, setRegistrationLoading] = useState(false);
  const [registrationError, setRegistrationError] = useState('');
  const [registrationSuccess, setRegistrationSuccess] = useState('');

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const [studentsResult, facultyResult, departmentsResult, coursesResult] = await Promise.allSettled([
          adminService.getAllStudents(),
          adminService.getFacultyCount(),
          adminService.getDepartments(),
          adminService.getCourseCount()
        ]);
        if (active) {
          if (studentsResult.status === 'fulfilled') setStudents(Array.isArray(studentsResult.value) ? studentsResult.value : []);
          if (facultyResult.status === 'fulfilled') {
            const rawVal = facultyResult.value;
            const parsedCount = typeof rawVal === 'number' ? rawVal : (typeof rawVal === 'object' && rawVal !== null ? Number(rawVal.count || rawVal.facultyCount || rawVal.total || 0) : Number(rawVal) || 0);
            setFacultyCount(parsedCount);
          }
          if (departmentsResult.status === 'fulfilled') setDepartments(Array.isArray(departmentsResult.value) && departmentsResult.value.length > 0 ? departmentsResult.value : departmentOptions);
          if (coursesResult.status === 'fulfilled') setCourseCount(Number(coursesResult.value) || courseOptions.length);
        }
      } catch (e) {
        if (active) setErr(e?.message || 'Could not load dashboard data');
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, []);

  useEffect(() => {
    if (!registrationForm.departmentId) {
      setCourses(courseOptions);
      return;
    }
    const matchingCourses = courseOptions.filter((course) => course.departmentId === Number(registrationForm.departmentId));
    setCourses(matchingCourses);
  }, [registrationForm.departmentId]);

  useEffect(() => {
    if (!registrationForm.courseId) {
      setBranches(branchOptions);
      return;
    }
    const matchingBranches = branchOptions.filter((branch) => branch.courseId === Number(registrationForm.courseId));
    setBranches(matchingBranches);
  }, [registrationForm.courseId]);

  const today = new Date().toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  const [showDepartmentModal, setShowDepartmentModal] = useState(false);
  const [departmentForm, setDepartmentForm] = useState({ name: '' });
  const [departmentLoading, setDepartmentLoading] = useState(false);
  const [departmentError, setDepartmentError] = useState('');
  const [departmentSuccess, setDepartmentSuccess] = useState('');

  const openDepartmentModal = () => {
    setDepartmentError('');
    setDepartmentSuccess('');
    setDepartmentForm({ name: '' });
    setShowDepartmentModal(true);
  };

  const closeDepartmentModal = () => {
    if (!departmentLoading) setShowDepartmentModal(false);
  };

  const submitDepartment = async (event) => {
    event.preventDefault();
    setDepartmentError('');
    setDepartmentSuccess('');
    setDepartmentLoading(true);
    const cleanName = departmentForm.name.trim();
    try {
      const res = await adminService.createDepartment(cleanName);
      setDepartmentSuccess(typeof res === 'string' ? res : `${cleanName} department added successfully to DB!`);
      setDepartmentForm({ name: '' });
      try {
        const fetchedDepts = await adminService.getDepartments();
        if (Array.isArray(fetchedDepts) && fetchedDepts.length > 0) {
          setDepartments(fetchedDepts);
        }
      } catch (_e) {
        // ignore fetch error
      }
    } catch (error) {
      setDepartmentError(error?.message || 'Failed to add department to database');
    } finally {
      setDepartmentLoading(false);
    }
  };

  const [showCourseModal, setShowCourseModal] = useState(false);
  const [courseForm, setCourseForm] = useState({ name: '', duration: 4, departmentId: '' });
  const [courseLoading, setCourseLoading] = useState(false);
  const [courseError, setCourseError] = useState('');
  const [courseSuccess, setCourseSuccess] = useState('');

  const openCourseModal = () => {
    setCourseError('');
    setCourseSuccess('');
    setCourseForm({ name: '', duration: 4, departmentId: departments[0]?.id ? String(departments[0].id) : '1' });
    setShowCourseModal(true);
  };

  const closeCourseModal = () => {
    if (!courseLoading) setShowCourseModal(false);
  };

  const submitCourse = async (event) => {
    event.preventDefault();
    setCourseError('');
    setCourseSuccess('');
    setCourseLoading(true);
    const cleanCourseName = courseForm.name.trim();
    const deptId = Number(courseForm.departmentId);
    const dur = Number(courseForm.duration);
    try {
      const res = await adminService.insertCourse(cleanCourseName, dur, deptId);
      setCourseSuccess(typeof res === 'string' ? res : `${cleanCourseName} inserted successfully into DB!`);
      setCourseCount((prev) => prev + 1);
      const newCourseObj = {
        id: courseOptions.length + 100 + Math.floor(Math.random() * 1000),
        departmentId: deptId,
        name: cleanCourseName
      };
      courseOptions.push(newCourseObj);
      setCourses([...courseOptions]);
      setCourseForm({ name: '', duration: 4, departmentId: departments[0]?.id ? String(departments[0].id) : '1' });
    } catch (error) {
      setCourseError(error?.message || 'Failed to insert course into database');
    } finally {
      setCourseLoading(false);
    }
  };

  const openRegistration = (role) => {
    setRegistrationRole(role);
    setRegistrationError('');
    setRegistrationSuccess('');
  };

  const closeRegistration = () => {
    if (!registrationLoading) setRegistrationRole(null);
  };

  const submitRegistration = async (event) => {
    event.preventDefault();
    setRegistrationError('');
    setRegistrationSuccess('');
    setRegistrationLoading(true);
    const payload = {
      name: registrationForm.name.trim(),
      email: registrationForm.email.trim(),
      password: registrationForm.password
    };
    if (registrationRole === 'STUDENT' || registrationRole === 'FACULTY') {
      payload.departmentId = Number(registrationForm.departmentId);
      payload.courseId = Number(registrationForm.courseId);
      payload.branchId = Number(registrationForm.branchId);
    }
    if (registrationRole === 'FACULTY') {
      payload.gender = registrationForm.gender;
      payload.designation = registrationForm.designation;
    }
    try {
      const result = registrationRole === 'ADMIN'
        ? await adminService.registerAdmin(payload)
        : registrationRole === 'STUDENT'
          ? await adminService.registerStudent(payload)
          : await adminService.registerFaculty(payload);
      setRegistrationSuccess(`${result?.name || payload.name} registered successfully.`);
      if (registrationRole === 'FACULTY') {
        setFacultyCount((prev) => prev + 1);
        adminService.getFacultyCount().then((cnt) => {
          const num = typeof cnt === 'number' ? cnt : Number(cnt) || 0;
          if (num > 0) setFacultyCount(num);
        }).catch(() => {});
      } else if (registrationRole === 'STUDENT') {
        setStudents((prev) => [...prev, result?.name || payload.name]);
      }
      setRegistrationForm({ name: '', email: '', password: '', departmentId: '', courseId: '', branchId: '', gender: 'MALE', designation: 'LECTURER' });
    } catch (error) {
      setRegistrationError(error?.message || 'Registration failed');
    } finally {
      setRegistrationLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Welcome banner */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-5 md:p-6 shadow-sm">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              {today}
            </p>
            <h2 className="mt-1 text-xl font-bold tracking-tight text-slate-900 md:text-2xl">
              Welcome back, {user?.name?.split(' ')[0] || user?.email?.split('@')[0] || 'Admin'} 👋
            </h2>
            <p className="mt-0.5 text-xs text-slate-500 md:text-sm">
              Noida International University · Administrative Command Center
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-600">
              <span className="h-2 w-2 rounded-full bg-emerald-500" /> System Online
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-800">
              Administrator
            </span>
          </div>
        </div>
      </div>

      {/* Stat cards */}
      <section>
        <h3 className="mb-3 text-xs font-extrabold uppercase tracking-wider text-slate-500">
          Institution Overview
        </h3>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="erp-stat-card border-slate-200 animate-pulse">
                <div className="h-4 w-24 rounded bg-slate-200" />
                <div className="mt-4 h-8 w-16 rounded bg-slate-200" />
                <div className="mt-3 h-3 w-32 rounded bg-slate-100" />
              </div>
            ))
          ) : (
            <>
              <DashboardCard
                title="Total Students"
                value={students.length}
                accent="purple"
                description="Registered in NIU portal"
                icon={
                  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
                    <path d="M6 12v5c3 3 9 3 12 0v-5" />
                  </svg>
                }
              />
              <DashboardCard
                title="Faculty Members"
                value={facultyCount}
                accent="teal"
                description="Registered faculty members"
                icon={
                  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                  </svg>
                }
              />
              <DashboardCard
                title="Departments"
                value={departments.length}
                accent="blue"
                description={departments.map((d) => d.code || d.name).slice(0, 5).join(', ')}
                icon={
                  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 21h18" />
                    <path d="M5 21V7l8-4v18" />
                    <path d="M19 21V11l-6-4" />
                  </svg>
                }
              />
              <DashboardCard
                title="Active Courses"
                value={courseCount}
                accent="amber"
                description="Courses in academic catalog"
                icon={
                  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
                    <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
                  </svg>
                }
              />
            </>
          )}
        </div>
      </section>

      {/* Quick Actions */}
      <section>
        <h3 className="mb-3 text-xs font-extrabold uppercase tracking-wider text-slate-500">
          Management Actions
        </h3>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <QuickActionCard
            accent="purple"
            title="Register Student"
            description="Enroll a new student"
            onClick={() => openRegistration('STUDENT')}
            icon={
              <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="8.5" cy="7" r="4" />
                <line x1="20" y1="8" x2="20" y2="14" />
                <line x1="23" y1="11" x2="17" y2="11" />
              </svg>
            }
          />
          <QuickActionCard
            accent="teal"
            title="Register Faculty"
            description="Add a new faculty member"
            onClick={() => openRegistration('FACULTY')}
            icon={
              <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M19 8v6" />
                <path d="M22 11h-6" />
              </svg>
            }
          />
          <QuickActionCard
            accent="blue"
            title="Add Department"
            description="Create a new department"
            onClick={openDepartmentModal}
            icon={
              <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 21h18" />
                <path d="M5 21V7l8-4v18" />
                <path d="M19 21V11l-6-4" />
                <line x1="12" y1="11" x2="12" y2="17" />
                <line x1="9" y1="14" x2="15" y2="14" />
              </svg>
            }
          />
          <QuickActionCard
            accent="indigo"
            title="Insert Course"
            description="Add a new course offering"
            onClick={openCourseModal}
            icon={
              <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" />
                <path d="M9 7h6" />
                <path d="M9 11h4" />
              </svg>
            }
          />
        </div>
      </section>

      <KnowledgeUploadPanel />

      <section>
        <div className="space-y-6">
          <div className="erp-card border-niu-green-200/60 bg-gradient-to-br from-niu-green-50/50 via-white to-amber-50/20 p-6">
            <h3 className="text-base font-bold text-slate-900">Administrative Utilities</h3>
            <ul className="mt-4 space-y-2 text-sm">
              {[
                { label: 'Reset user password', icon: '🔐' },
                { label: 'Update student profile', icon: '✏️' },
                { label: 'Remove a student record', icon: '🗑️' },
                { label: 'Update department details', icon: '🏛️' }
              ].map((s) => (
                <li key={s.label} className="flex items-center gap-3 rounded-xl px-3 py-2 text-slate-700 hover:bg-white shadow-sm transition">
                  <span className="text-lg">{s.icon}</span>
                  <span className="flex-1 font-medium">{s.label}</span>
                  <svg className="h-4 w-4 text-slate-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" />
                  </svg>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {registrationRole ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm" onMouseDown={closeRegistration}>
          <section className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl" onMouseDown={(event) => event.stopPropagation()} role="dialog" aria-modal="true" aria-labelledby="registration-title">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-niu-green-600">Admin Portal</p>
                <h3 id="registration-title" className="mt-1 text-xl font-black text-slate-900">Register {registrationRole === 'STUDENT' ? 'Student' : registrationRole === 'ADMIN' ? 'Admin' : 'Faculty'}</h3>
              </div>
              <button type="button" onClick={closeRegistration} className="rounded-lg px-2 py-1 text-xl text-slate-400 hover:bg-slate-100 hover:text-slate-700" aria-label="Close registration dialog">×</button>
            </div>
            <form className="mt-6 space-y-4" onSubmit={submitRegistration}>
              <label className="erp-label">Full name<input className="erp-input mt-1" required value={registrationForm.name} onChange={(event) => setRegistrationForm({ ...registrationForm, name: event.target.value })} /></label>
              <label className="erp-label">Email<input className="erp-input mt-1" required type="email" value={registrationForm.email} onChange={(event) => setRegistrationForm({ ...registrationForm, email: event.target.value })} /></label>
              <label className="erp-label">Password<input className="erp-input mt-1" required minLength={4} type="password" value={registrationForm.password} onChange={(event) => setRegistrationForm({ ...registrationForm, password: event.target.value })} /></label>
              {registrationRole === 'STUDENT' || registrationRole === 'FACULTY' ? (
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="erp-label sm:col-span-2">
                    Department
                    <select
                      className="erp-input mt-1"
                      required
                      value={registrationForm.departmentId}
                      onChange={(event) => {
                        const deptId = event.target.value;
                        setRegistrationForm({ ...registrationForm, departmentId: deptId, courseId: '', branchId: '' });
                      }}
                    >
                      <option value="">Choose department</option>
                      {departments.map((department) => (
                        <option key={department.id} value={department.id}>{department.code} - {department.name}</option>
                      ))}
                    </select>
                  </label>
                  <label className="erp-label">
                    Course
                    <select
                      className="erp-input mt-1"
                      required
                      value={registrationForm.courseId}
                      onChange={(event) => {
                        const selectedCourseId = event.target.value;
                        const selectedCourse = courseOptions.find((c) => c.id === Number(selectedCourseId));
                        setRegistrationForm({
                          ...registrationForm,
                          courseId: selectedCourseId,
                          departmentId: selectedCourse ? String(selectedCourse.departmentId) : registrationForm.departmentId,
                          branchId: ''
                        });
                      }}
                    >
                      <option value="">Choose course</option>
                      {(registrationForm.departmentId
                        ? courseOptions.filter((c) => c.departmentId === Number(registrationForm.departmentId))
                        : courseOptions
                      ).map((course) => (
                        <option key={course.id} value={course.id}>{course.name}</option>
                      ))}
                    </select>
                  </label>
                  <label className="erp-label">
                    Branch
                    <select
                      className="erp-input mt-1"
                      required
                      value={registrationForm.branchId}
                      onChange={(event) => setRegistrationForm({ ...registrationForm, branchId: event.target.value })}
                      disabled={!registrationForm.courseId}
                    >
                      <option value="">{registrationForm.courseId ? "Choose branch" : "Choose course first"}</option>
                      {(registrationForm.courseId
                        ? branchOptions.filter((b) => b.courseId === Number(registrationForm.courseId))
                        : []
                      ).map((branch) => (
                        <option key={branch.id} value={branch.id}>{branch.name}</option>
                      ))}
                    </select>
                  </label>
                  {registrationRole === 'FACULTY' ? (
                    <>
                      <label className="erp-label">
                        Gender
                        <select className="erp-input mt-1" value={registrationForm.gender} onChange={(event) => setRegistrationForm({ ...registrationForm, gender: event.target.value })}>
                          <option value="MALE">Male</option>
                          <option value="FEMALE">Female</option>
                          <option value="OTHER">Other</option>
                        </select>
                      </label>
                      <label className="erp-label sm:col-span-2">
                        Designation
                        <select className="erp-input mt-1" value={registrationForm.designation} onChange={(event) => setRegistrationForm({ ...registrationForm, designation: event.target.value })}>
                          <option value="PROFESSOR">Professor</option>
                          <option value="ASSOCIATE_PROFESSOR">Associate Professor</option>
                          <option value="ASSISTANT_PROFESSOR">Assistant Professor</option>
                          <option value="HOD">HOD</option>
                          <option value="LAB_ASSISTANT">Lab Assistant</option>
                          <option value="LECTURER">Lecturer</option>
                          <option value="GUEST_FACULTY">Guest Faculty</option>
                        </select>
                      </label>
                    </>
                  ) : null}
                </div>
              ) : null}
              {registrationError ? <ErrorMessage message={registrationError} /> : null}
              {registrationSuccess ? <p className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm font-semibold text-emerald-800">{registrationSuccess}</p> : null}
              <button type="submit" className="erp-btn-primary w-full" disabled={registrationLoading}>{registrationLoading ? <LoadingSpinner size="sm" color="text-white" /> : null}{registrationLoading ? 'Registering...' : `Register ${registrationRole === 'STUDENT' ? 'Student' : registrationRole === 'ADMIN' ? 'Admin' : 'Faculty'}`}</button>
            </form>
          </section>
        </div>
      ) : null}

      {showDepartmentModal ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm" onMouseDown={closeDepartmentModal}>
          <section className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl" onMouseDown={(event) => event.stopPropagation()} role="dialog" aria-modal="true" aria-labelledby="department-title">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-niu-green-600">Admin Portal</p>
                <h3 id="department-title" className="mt-1 text-xl font-black text-slate-900">Add New Department</h3>
              </div>
              <button type="button" onClick={closeDepartmentModal} className="rounded-lg px-2 py-1 text-xl text-slate-400 hover:bg-slate-100 hover:text-slate-700" aria-label="Close department dialog">×</button>
            </div>
            <form className="mt-6 space-y-4" onSubmit={submitDepartment}>
              <label className="erp-label">
                Department Name
                <input
                  className="erp-input mt-1"
                  required
                  placeholder="e.g. School of Artificial Intelligence"
                  value={departmentForm.name}
                  onChange={(event) => setDepartmentForm({ name: event.target.value })}
                />
              </label>
              {departmentError ? <ErrorMessage message={departmentError} /> : null}
              {departmentSuccess ? <p className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm font-semibold text-emerald-800">{departmentSuccess}</p> : null}
              <button type="submit" className="erp-btn-primary w-full" disabled={departmentLoading}>
                {departmentLoading ? <LoadingSpinner size="sm" color="text-white" /> : null}
                {departmentLoading ? 'Adding Department...' : 'Create Department'}
              </button>
            </form>
          </section>
        </div>
      ) : null}

      {showCourseModal ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm" onMouseDown={closeCourseModal}>
          <section className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl" onMouseDown={(event) => event.stopPropagation()} role="dialog" aria-modal="true" aria-labelledby="course-title">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-niu-green-600">Admin Portal</p>
                <h3 id="course-title" className="mt-1 text-xl font-black text-slate-900">Insert New Course</h3>
              </div>
              <button type="button" onClick={closeCourseModal} className="rounded-lg px-2 py-1 text-xl text-slate-400 hover:bg-slate-100 hover:text-slate-700" aria-label="Close course dialog">×</button>
            </div>
            <form className="mt-6 space-y-4" onSubmit={submitCourse}>
              <label className="erp-label">
                Select Department
                <select
                  className="erp-input mt-1"
                  required
                  value={courseForm.departmentId}
                  onChange={(event) => setCourseForm({ ...courseForm, departmentId: event.target.value })}
                >
                  <option value="">Choose department</option>
                  {departments.map((dept) => (
                    <option key={dept.id} value={dept.id}>{dept.code ? `${dept.code} - ` : ''}{dept.name}</option>
                  ))}
                </select>
              </label>
              <label className="erp-label">
                Course Name
                <input
                  className="erp-input mt-1"
                  required
                  placeholder="e.g. B.Tech Computer Science"
                  value={courseForm.name}
                  onChange={(event) => setCourseForm({ ...courseForm, name: event.target.value })}
                />
              </label>
              <label className="erp-label">
                Duration (Years)
                <input
                  className="erp-input mt-1"
                  type="number"
                  min="1"
                  max="6"
                  required
                  value={courseForm.duration}
                  onChange={(event) => setCourseForm({ ...courseForm, duration: event.target.value })}
                />
              </label>
              {courseError ? <ErrorMessage message={courseError} /> : null}
              {courseSuccess ? <p className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm font-semibold text-emerald-800">{courseSuccess}</p> : null}
              <button type="submit" className="erp-btn-primary w-full" disabled={courseLoading}>
                {courseLoading ? <LoadingSpinner size="sm" color="text-white" /> : null}
                {courseLoading ? 'Inserting Course...' : 'Insert Course'}
              </button>
            </form>
          </section>
        </div>
      ) : null}
    </div>
  );
}
