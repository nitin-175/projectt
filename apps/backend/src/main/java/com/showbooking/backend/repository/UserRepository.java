package com.showbooking.backend.repository;

import com.showbooking.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    boolean existsByEmail(String email);
    boolean existsByEmailAndIdNot(String email, Long id);

    @Query("select count(distinct u.id) from User u join u.roles r where r.name = :roleName")
    long countByRoleName(@Param("roleName") com.showbooking.backend.entity.AppRole roleName);
}
