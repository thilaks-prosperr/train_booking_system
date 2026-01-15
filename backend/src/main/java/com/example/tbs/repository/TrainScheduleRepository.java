package com.example.tbs.repository;

import com.example.tbs.entity.TrainSchedule;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface TrainScheduleRepository extends JpaRepository<TrainSchedule, Long> {
    java.util.Optional<TrainSchedule> findByTrainAndStation(com.example.tbs.entity.Train train,
            com.example.tbs.entity.Station station);

    java.util.List<TrainSchedule> findByTrain(com.example.tbs.entity.Train train);
}
